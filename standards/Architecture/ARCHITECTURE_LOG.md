# 架构决策与演进记录

> 记录每一次"为什么这么改"，以及"改了什么具体点"，避免未来推翻重来时忘记取舍理由。

---

## 决策 17（2026-07-09）· Markdown Engine V1 独立化（根目录 markdown-engine/ + SPEC/DESIGN/ADR 三文档契约落地 + Vue 适配层薄封装）

### 为什么改
ADR0709 v3 Content Engine 目录重构完成后，`app/render/` 域的 Parser/Transformer/Renderer 仍存在三项**长期不可接受**的架构缺陷，若不修正 2~3 个迭代内会演变成无法回迁的技术债：
1. **与 Vue 强耦合**：`vueRenderer.js` 直接返回 Vue VNode/组件引用、`MarkdownRenderer.vue` 直接 `marked.parse()` 内嵌解析逻辑——引擎变成"Vue 的渲染组件"，丧失「独立发 npm 包 / 未来接入 React/纯静态站点生成器 / 非 Vue 服务端渲染管道」的可能性；同时违反 ARCHITECTURE.md 最高层规则「公共 API 输出应为 JSON 而非组件引用」
2. **AST 无单一真源 + 类型漂移风险**：`app/core/contracts/{Parser,Transformer,Renderer}.ts` 各自定义了松散的接口（只有 method 签名，没有节点 shape 约束），而 render 实际的 AST 节点类型完全没写类型——长期下来 Contract 和实现一定漂移，出现类型错误要回溯 3 层才找得到根因
3. **缺少引擎级公共 API 门面**：业务代码（或未来的 React 调用方）要拿 Parser→调 getParser→Transformer→自己遍历 order→Renderer→自己拼，没有稳定的 `createEngine().run(content)` 管道抽象；每次新增 Transformer 需要改 N 个调用方代码

同时，`standards/Architecture/ARCHITECTURE.md §6 "Markdown Engine 架构要求"` 已明确写死「Markdown Engine 必须独立维护在 `markdown-engine/` 根目录，禁止放在 modules/course 或 components 下作核心实现」——但之前代码实际放在 `app/render/` 内部，属于**架构契约违反**，必须落地修正。

本决策 100% 采纳「引擎根目录独立 + 应用层薄适配」方案，并与引擎内部 SPEC.MD / DESIGN.MD / ADR.md 三文档一一对应（所有实现细节均在 SPEC/DESIGN/ADR 有章节锚点，避免 ARCHITECTURE_LOG 与引擎内部文档重复）。

### 改了什么（10 个核心子决策，7 Phase 顺序落地）

**子决策 1 · Markdown Engine 物理位置 = 仓库根目录 `markdown-engine/`（强制执行，不在 app/ 下）**
- ✅ 新建 `markdown-engine/` 根级目录，保持 ARCHITECTURE.md §6 规范目录结构：`RFC/ / src/ / tests/ / fixtures/ / SPEC.MD / DESIGN.MD / ADR.md / VERSION.md（预留）`
- ❌ 永久删除「把 Markdown Engine 放 app/markdown-engine 或 app/render/modules/markdown 之类 app 内路径」的方案——未来想独立发 npm 包，必须一开始就保持零 Nuxt/Vue/DB 依赖
- 对应文档锚点：ARCHITECTURE.md §4 Markdown Engine「位置强制执行」+ ADR.md 001

**子决策 2 · 平台公共路径别名 `@me` → `markdown-engine/src`（经典坑：双 paths 入口）**
- nuxt.config.ts alias + vite.resolve.alias 同时配置：`'@me': path.resolve(rootDir, 'markdown-engine/src')`
- tsconfig.json compilerOptions.paths 配置**两条**（tsconfig paths 经典坑：`@me/*` 不匹配裸 `@me`）：`"@me": ["markdown-engine/src"], "@me/*": ["markdown-engine/src/*"]`；同时 include 数组补 `"markdown-engine/**/*.ts"`
- 业务代码**统一** `import { createEngine, renderToHTML } from '@me'` 或 `import type { AstNode, VNode } from '@me/ast/types'`；禁止直接写相对路径或内部子路径 import
- 对应踩坑：PROJECT_STATUS.md §七 踩坑 1

**子决策 3 · Parser 技术选型 = marked.lexer() + 手动 MDAST 转换器**
- 选型对比（详见 DESIGN.MD §11.1 / ADR.md 002）：marked.lexer（①项目已装无新依赖；②API 稳定；③tokens 扁平易转 AST；④GFM 默认支持） vs remark（要引 6+ 依赖；体积大） vs markdown-it（非标准 AST）→ 选 marked.lexer
- 实现：`parser/markdown.ts: parseMarkdown(raw, opts?)` = `extractFrontmatter(raw)` → `marked.lexer(body, {gfm:true})` → `convertBlockTokens(tokens)`（递归 `convertInlineTokens`）→ 组装 `RootAstNode {type:'root', children, frontmatter, content}`
- Parser 可替换承诺：Parser 不是公共接口（公共接口是 AST Schema + Public API），未来换 remark/MDX 只要输出 MDAST 兼容 AST 即可，对 Module/Page 零影响（ARCHITECTURE.md §7 对齐）
- 对应文档：DESIGN.MD §11.1-11.2 / ADR.md 002

**子决策 4 · AST Schema 单一真源 = Engine `src/ast/types.ts`，应用层 Contracts 只做 re-export**
- `markdown-engine/src/ast/types.ts` 定义全部类型：`AstNode / RootAstNode / TransformedRootAstNode / VNode / AstNodeType / TocEntry / HeadingInfo / ReadingTimeInfo / Plugin / RenderPipelineInput / RenderPipelineOptions / RenderPipelineResult`
- 应用层**彻底禁止自行复制 AST 类型**：`app/core/contracts/Parser.ts` / `Transformer.ts` / `Renderer.ts` 三个文件只写 `export type { AstNode, RootAstNode, TransformerContext, RendererContext, VNode } from '@me/ast/types'`——保证类型永远只有一份
- 关键对齐：根节点 `type:'root'`（MDAST 标准，**不是 `document`**，旧别名已废弃）；VNode 形状严格是 `{type, is, props, children}`（框架无关 JSON，可 JSON.stringify）
- 对应文档：SPEC.MD §7 / DESIGN.MD §5

**子决策 5 · 6 内置 Transformer 全部重写为 AST 原生操作 Plugin（TS 化）+ 共享 utility 文本提取**
- 6 个 Plugin 清单 + order 常量表（写死顺序，不可随意改）：**heading(10) → toc(20) → links(30) → excerpt(40) → readingTime(50) → reference(100)**（小先执行）
- 新增 `transformer/utils.ts: extractTextFromNode(node)`：统一处理「heading/paragraph 的纯文本提取」（value 存在→返回 value；children 存在→递归 map join；否则空串）——heading slug / TOC 标题 / excerpt 摘要 / readingTime 字数统计**四处全用它**，避免各自写各自取字段逻辑导致 heading id 全是 h-1/h-2 兜底值
- 关键产出：heading 节点挂 id；ast.headings[] = HeadingInfo[]；ast.toc[] = TocEntry[]（从 headings[] 取，不再自己扫一遍 children，顺序保证一致）；ast.excerpt；ast.readingTime + ast.readingTimeMinutes；ast.references = []
- 对应踩坑：PROJECT_STATUS.md §七 踩坑 5 / 7；对应文档：DESIGN.MD §12 / ADR.md 007

**子决策 6 · Plugin Registry 由 Engine 自管（Map-based 40 行极简 IoC），不依赖 @core/registry**
- 架构约束：Engine 必须独立可发布 npm 包 → 不能 import 任何 app/ 路径（包括 @core/registry），否则发布时要把 @core/registry 也打进去，耦合爆炸
- 实现：`plugins/registry.ts` = `new Map<string, PluginDefinition>()`，4 个核心 API：`registerPlugin(plugin, order?)`（名字唯一，同名覆盖）/ `getPlugins()`（sort by order ASC 返回）/ `runPlugins(ast, ctx?)`（串式 await transform）/ `clearPlugins()`（测试用）；配套 `plugins/types.ts: Plugin interface`、`plugins/builtin.ts: registerBuiltinPlugins(enabled?)` 注册 6 个内置插件
- 与 @core/registry 的兼容：应用层 `app/render/register.ts` 作为**薄适配层**，把 Engine 的 Parser/Renderer 用兼容格式注册进 app 的 @core/registry，保持旧业务代码 `getParser('markdown') / getRenderer('vue')` 调用方式**零变动**——Engine 本身不知道 @core/registry 存在
- 对应文档：DESIGN.MD §13 / ADR.md 003

**子决策 7 · 双 Renderer 实现：HTML（marked.parse 委托 v1 策略）+ JSON VNode 描述树（手写递归）**
- **HTML Renderer v1**：**不写递归 AST→HTML**（表格/任务列表/嵌套 emphasis edge case 处理量太大），而是**委托 marked.parse(ast.content) + marked.use(Renderer) 注入同一份 slugifyHeading()**——复杂度/完备度/一致性三项权衡最优（marked 十几年生态兜底 GFM 细节；heading id 和 heading transformer 因为 import 同一个纯函数，100% 完全一致）；v2 需要自定义节点 HTML 时新增纯手写 AST→HTML，通过 `createEngine({htmlRenderer: 'ast-native'})` 切换
- **VNode Renderer**：手写递归 AST→VNode，每个 AstNode.type 对应一个 VNode shape（如 heading→`{type:'heading', is:'h2', props:{id}, children}`；math→`{type:'math', is:'KatexElement', props:{formula,display}}`）。**关键红线**：VNode 的 `is` 是**字符串**（HTML tag 或组件名），**绝不**出现 Vue component 引用——由 UI 层 `<component :is="node.is" v-bind="node.props">` 动态渲染
- 对应踩坑：PROJECT_STATUS.md §七 踩坑 4（marked v18 Renderer API 签名对象化）；对应文档：DESIGN.MD §11.3 / §8 / ADR.md 005 / 006 / 008

**子决策 8 · 公共 API 门面 Pipeline + index.ts 完整导出清单**
- `pipeline/pipeline.ts`：四格式输入归一化（string / AST / {body} / {ast}）→ parse → runPlugins → renderer 选择（html/vnode）→ errors 收集；导出 `runRenderPipeline() / renderToHTML() / renderToVNode()` + `compile()` = 一次性返回 html+vnode+ast+enhancedAST+errors
- `src/index.ts`（公共 API 唯一出口）：
  - 实例模式：`createEngine(config?)` / `getEngine()`（延迟单例，95% 场景用）/ `setEngine(e)`（测试 mock）
  - 便捷函数：`parseMarkdown / runRenderPipeline / renderToHTML / renderToVNode`（内部走 getEngine()）
  - Plugin 低阶 API：`registerPlugin / unregisterPlugin / getPlugins / clearPlugins / registerBuiltinPlugins`
  - 类型全量 re-export：从 `./ast/types.ts` + `./plugins/types.ts` + `./pipeline/pipeline.ts` 汇总导出，业务代码不需要 import 内部子路径
- 对应文档：SPEC.MD §4

**子决策 9 · 应用层适配：app/render/ 全量降级为 Vue 薄适配层，删除 9 个旧 JS Parser/Transformer 文件**
- `app/render/pipeline.ts`：重写为 20 行左右的薄壳（直接 delegate 给 `@me/runRenderPipeline`），不再自己做 parse/transform/render
- `app/render/register.ts`：薄适配层，把 Engine 的 Parser/Renderer 以兼容格式注册进 @core/registry，Transformer 虽然实际跑在 Engine 插件系统里，但保持 @core/registry 的 Transformer 查询仍可用（向后兼容）
- `app/render/renderers/vueRenderer.js`：调用 Engine 的 runRenderPipeline / renderToHTML，返回 engine 产物（不是 Vue 组件引用）；修复 TS cast 语法删除（`result.rendered as string` → `result.rendered || ''`，JS 不允许 TS8006）
- `app/render/theme/MarkdownRenderer.vue`：调用 Engine 的 run 方法拿结果渲染；同样修复 `as string` cast 语法
- 删除冗余文件：`app/render/parsers/markdown.js / frontmatter.js / math.js`（3 Parser 旧实现）、`app/render/transformers/heading.js / toc.js / links.js / excerpt.js / readingTime.js / reference.js`（6 Transformer 旧实现）→ 共 9 个旧 JS 文件彻底删除，避免「两套实现并存」长期混乱
- 对应踩坑：PROJECT_STATUS.md §七 踩坑 2 / 3

**子决策 10 · 独立测试：4 Fixtures + 15 单元测试，全部不依赖 Nuxt/Nitro，纯 node+tsx 可运行**
- 4 Fixtures：`tests/fixtures/basic.md`（frontmatter + 标题/粗体/列表/引用/外链/代码/表格）、`math.md`（行内/块级公式）、`table.md`（GFM 表格对齐）、`code.md`（多 fenced code block）
- 7 Parser 单测：basic 解析 / code block / table / list / frontmatter 提取与剥离 / 空字符串安全 / opts.math 注入 math&inlineMath 节点——全部 parseMarkdown() 直接跑（npx tsx 即可，不需要 nuxt dev server）
- 8 Pipeline 全链路：内置插件数量 + 插件名包含 heading/toc / HTML 输出非空 + 含 h1 / VNode 输出 type='root' / compile() 返回全字段 / heading 插件产出 ast.headings[] / toc 插件条目数正确 / readingTime.minutes 存在 / 合法输入 errors=[]——覆盖完整公共 API 行为
- 三连验证（Build + Sync + 15 Tests）：三条全绿 = Engine 独立化成功，见 PROJECT_STATUS.md §七「验证四连」表
- 对应踩坑：PROJECT_STATUS.md §七 踩坑 6（frontmatter 断言太宽）

### 7 项关键踩坑汇总（每一项都让构建/测试炸过一次，完整根因 + 解见 PROJECT_STATUS.md §七）
| # | 踩坑一句话 | 核心修法 |
|---|-----------|---------|
| 1 | `@me` 别名指向 `markdown-engine/`（根）→ `@me/ast/types` 解析不到文件 | 改成 `@me`→`markdown-engine/src`（双 paths 入口） |
| 2 | index.ts Plugin 类型从 registry.ts import（实际定义在 types.ts）→ 找不到类型 | Plugin type 改从 `./plugins/types` import；registry.ts 只 export 内部 PluginDefinition |
| 3 | vueRenderer.js / MarkdownRenderer.vue 写 `(x as string)` → Nitro build TS8006（JS 不允许 TS cast） | 统一改 `result.rendered || ''` 运行时兜底 |
| 4 | marked v18 改了 Renderer.heading 签名为对象 `{tokens, depth}`，旧四参数直接运行抛错 | 改 `marked.use({renderer: { heading({ tokens, depth }) { ... } } })`；heading id 共用 slugifyHeading() 纯函数 |
| 5 | heading/toc 用 `node.value || node.content` 拿文本 → 得 undefined → id 全为 h-1/h-2 兜底、TOC 条目空 | 新增 extractTextFromNode(node) 递归 utility，四处统一用它 |
| 6 | parser 断言 `!ast.content.includes('---')` 太宽 → GFM 表格正文本来就含 `| --- | --- |` 导致断言失败 | 改成 `!ast.content.trimStart().startsWith('---')`（仅剥离开头 frontmatter 块） |
| 7 | heading transformer 只 set 节点 id，忘了收集 ast.headings[] → pipeline 断言 ast.headings = undefined | 遍历到 heading 节点时 push `{id, text, level}` 进 ast.headings；toc 从该数组取（不再自己扫一遍 children） |

### 权衡
- **优点（架构长期价值）**：
  1. **Engine 独立性 100%**：零 Nuxt/Vue/DB 依赖，2 个人周内可独立发布 npm 包；未来 React 端、后台脚本、纯 Node 服务端都能用同一份引擎
  2. **AST 类型单一真源**：再也不会出现「Contract 和实现类型漂移互相找不到」的问题；所有 AST 改动能被 TypeScript 全局检查出来
  3. **公共 API 稳定**：`createEngine().run()` / `compile()` 统一门面，业务代码再也不用自己管理 Parser→Transformer×N→Renderer 顺序；新增 Transformer 只改 Engine 内 registerBuiltinPlugins，调用方零改动
  4. **渲染层零框架绑定**：VNode 是纯 JSON → 同一份内容 Vue 能渲染、React 能渲染、Web Components 能渲染、未来 AI 结构化读取也能直接解析；完全符合 ARCHITECTURE.md 最高层契约
  5. **独立可测 = CI 友好**：15 单测不依赖 Nuxt/Nitro，npx tsx 直接跑；未来加 100 个测试也不需要启动 Nuxt Dev Server，CI 时间 +2s 级别
- **代价（一次性迁移成本 + 长期小幅维护）**：
  1. 迁移文件/改 import/删旧实现工作量 ≈ 4~6h（已完成）；加上写 4 份对齐文档 ≈ 2h
  2. marked v18 API 对象化后，升级 marked 大版本时要再检查一次 Renderer 签名（但 marked 有 LTS，大版本升级频率低）
  3. 所有旧的「直接从 app/render/transformers/xxx 手写 import」代码（如果存在）要改成用 Engine Plugin 系统；目前没发现调用方，兼容期风险极低

### 实施约束（Engine 独立化期间 & 未来的死规则）
1. **四不变原则**（沿用 Content Engine v3 迁移约束）：公共 API 形状不变 · Contract 不变 · 调用链不变 · 功能不变——**调用 `@core/registry.getParser('markdown')` 的业务代码，本次迁移后一行都不需要改**
2. **Engine src/** 绝对禁止 5 类 import：违反任意一条 Code Review 直接打回：① Nuxt（`#imports` / `nuxt` / useHead/useRoute 等 auto-import）② Vue（`vue` 包 / `<script setup>` / ref/computed）③ 数据库（`#database/*` / drizzle / `@data/*`）④ 业务服务（`@core/*` 除了 types 契约的公共 import；**特别是不能引 @core/registry，Engine 自管自己的 registry**）⑤ 业务组件 / app/ 下任何路径
3. **新增能力优先 Plugin 化**：新增「概念节点高亮 / 引用收集 / 练习题解析」等功能时：先写新 Plugin → 注册进 registerBuiltinPlugins 或调用方用 registerPlugin 追加；**不要直接改 parser/markdown.ts / pipeline/pipeline.ts 核心代码**，除非是修 Parser 的 token 转换 BUG
4. **AST Schema / 公共 API 的 Breaking Change 必须走 RFC**：加东西兼容导出没事；改东西（删除 API、改 AST 根节点 type、改默认插件 order、改 VNode 形状）必须先在 `markdown-engine/RFC/RFC-XXX-*.md` 写清楚兼容方案 + 14 天双导出期，再动代码

### 未来下一步建议（2~3 迭代内，V2 Educational Markdown）
1. **先写 2~4 份 RFC**：RFC-001 Concept 语法解析；RFC-002 Exercise 语法解析；RFC-003 Anchor 注入 + Links 汇总；RFC-004 代码高亮 + Mermaid
2. **Concept/Exercise Parser 接入**：按 DESIGN.MD §9 策略，**用 marked.use 扩展 custom tokenizer** 识别 `:::concept name=一次函数 description=... :::` / `:::exercise ... :::` 的 custom fence，然后 convertBlockToken 加 case，不用改 parser 主干 200 行代码
3. **htmlRenderer v2 手写 AST→HTML**：当 Concept/Exercise 有自定义 HTML 需求时新增 `renderer/htmlRenderer.native.ts`（递归 AST），保留 v1 marked 委托做 fallback；通过 createEngine({htmlRenderer}) 参数切换
4. **AST Snapshots 测试落地**：`tests/snapshots/basic.ast.json` 等 4 个快照文件，每次跑 parser.test.ts 对比 JSON diff——防止有人改了 token→AST 转换器导致下游 BUG（比如 heading id 算法变了但没人发现）
5. **Vercel Preview 页面级回归**：目前只有 15 单测；下一迭代加一个 `/tests/sandbox/markdown` 页面展示 4 fixtures 渲染结果，每次 PR 用 Preview URL 肉眼点一遍（避免 Engine 改动后 lesson 页面白屏但单测没覆盖到的 Vue 适配层 BUG）

---

## 决策 15（2026-07-08）· ADR0709 v2 应用目录结构非破坏性重构（去 modules + 五域分治 + 架构级移除 Content 命名）

### 为什么改
经过 ADR0708 目录快照评审，当前 `app/modules/content/` 存在以下不可接受的架构问题：
1. **modules/ 冗余层**：整个 modules/ 下只有 content 一个儿子 = 单父单子无意义
2. **Data / Render / Core 三域混杂**：repositories / parser / core 平铺 16 子目录，新成员扫 2 小时仍搞不清边界，容易误写跨域 import（Data→Render 直接引）
3. **Core 域定义虚假**：v1 方案把 Boot/Pipeline 都塞进 Core，实际 Boot 是应用启动（随功能加启动项频繁改）、Pipeline 是各领域内部实现，都不是"十年不变"的核心能力
4. **缺 Shared 地基层**：types/schema/utils 三处散放，Data 放、Render 想引就得跨域违规；Utils 分散 data/utils + render/utils + app/utils 三处，长期 O(n) 维护成本
5. **Query 顶层破坏 Nuxt 生态**：v1 想新建 `app/query/` 放 useCourse/useChapter 等 Composable，实际 100% 就是标准 Vue Composable，应回归 Nuxt 官方 `app/composables/`
6. **Loader 地位被过度抬高**：Loader 是 @deprecated 历史遗留（未来 Service 完全替代后删除），不应作为 Data 的一级公民围绕它设计
7. **Content 命名架构级无信息量**：未来输入类型含 Markdown/JSON/Exercise/Mermaid/Diagram/AI-Generated/Video/PDF，任何数据都可以是"内容"，Content=零信息量概念，长期制造命名摩擦
8. **Pipeline 不共享硬合并**：DataPipeline 走 Source→Repo→Service（SQL/连接串/事务），RenderPipeline 走 Parser→Transformer→Renderer（Markdown AST/VNode），两者唯一共同点=英文单词 Pipeline，强行合并到 `core/pipeline.ts` = 为了名字好看制造抽象

经过**两轮架构评审**，v1 方案方向正确（去 modules、Data-Render 拆分、Engine 提升应用层），但需要 8 条具体修订 → 最终本决策**100% 采纳第二轮 8 条评审意见**形成 v2 定稿。

### 改了什么（ADR0709 v2 核心决策 1~7）

**决策 1 · Core 域严格收敛为三子域（Contracts / Registry / Engine）**
- `app/core/contracts/`：Source/Loader/Query/Parser/Transformer/Renderer 六大能力协议 + assertContract()
- `app/core/registry/`：IoC 注册中心 register*/get*，零具体实现，实现由 bootstraps 通过参数传入
- `app/core/engine/`：组合根 + 统一 Facade（唯一"同时知道 Data+Render 存在"的特权）；内部 `engine/pipeline.ts` 是薄壳（仅分流 operation ∈ Data？→ data/pipeline；renderContent？→ render/pipeline），**不再暴露 `core/pipeline.ts` 顶层共享概念**
- ❌ 从 Core 迁出：boot → 独立顶层 app/boot/；types/schema/utils → Shared；DataPipeline / RenderPipeline → 各归各自领域

**决策 2 · Boot 独立顶层 `app/boot/`（Application Startup ≠ 核心能力）**
- `boot/index.ts`：纯编排 `bootEngine()` = Data 启动 → Render 启动 → Engine 初始化（无实现代码）
- `boot/data/database.ts`：注册 Source=neon-drizzle + Query=lazyQuery
- `boot/render/{parser,transformers,renderer}.ts`：按 order 注册 MarkdownParser + 7×Transformer + VueRenderer
- `boot/infra/`（.gitkeep 预留空）：未来 logger/metrics/storage/cache/analytics 基础设施启动
- 红线：同子目录 bootstrap 可互 import；跨子目录（data↔render↔infra）严禁互 import，只能由 boot/index.ts 顺序协调

**决策 3 · 新增 Shared 地基层（跨域纯类型 / 纯 DTO / 纯工具）**
- `app/shared/types/`：Course/Chapter/Lesson/Exercise/Asset 领域实体接口 + TocEntry/HeadingInfo 元信息；未来 User/Video/PDF/MermaidDiagram/AIGeneratedParagraph
- `app/shared/schema/`：DTO 投影行（ChapterListByCourseRow …） + Repository Filters/ListOptions
- `app/shared/utils/`：一桶天下（slug/hash/deepEqual/compact/groupBy/uniqBy/pick/omit/formatDate/escapeHtml/ORDER_TRANSFORMER 常量表/正则库），90% 工具默认放这
- Shared 四不红线：① 不 import Core ② 不 import Data/Render ③ 不含 if/else 业务判断 ④ 不含运行时单例状态
- Utils 白名单防分散：仅含 DB/SQL 专属（buildWhereClauseFromFilters）才放 `data/_internal/_utils/`；仅含 Markdown/AST 专属（walkAstNodes/buildTocTree）才放 `render/_utils/`

**决策 4 · Query 回归 Nuxt 官方 `app/composables/`（不新建 query/ 顶层破坏生态）**
- 迁移动作：`app/modules/content/query/{useCourse,useChapter,useLesson,useExercise}.js` → `app/composables/` 同名
- 与 Data 侧 `data/queries/`（仅 lazyQuery.ts = QueryContract Facade 纯 TS 无 Vue）命名彻底去歧义
- Nuxt 默认扫 composables/，`imports.dirs` 中删除 `'~/modules/content/query'` 条目，零新增配置

**决策 5 · Loader @deprecated 打入 Data 内部冷宫（不再是一级公民）**
- Data 一级公民严格 5 项（不多不少）：`sources / repositories / services / queries / pipeline.ts`
- `data/_internal/loaders/`：下划线前缀 + @deprecated JSDoc 标注（2 迭代后删除）
- 红线：server/api/** / composables/** / pages/** / render/** → 严禁 import `data/_internal/**`，Code Review 直接打回

**决策 6 · 架构级彻底移除 "Content" 命名（8 处重命名 + 7~14 天兼容期）**
- 重命名映射：`ContentEngineFacade→EngineFacade`、`ContentEnginePlugin→EnginePlugin`、`bootContentEngine()→bootEngine()`、`plugins/content-engine.*.js→engine.*.js`、`provide('contentEngine'...)` 主名改 `provide('engine'...)` 兼容 7 天双注入、`provide('contentQuery')` 合并进 `$engine.query`、`@modules/content/*` 别名 → `@core/@boot/@data/@render/@shared` 五新别名
- **例外保留 Content 的场合**：具体输入类型名精准保留（MarkdownRenderer、MermaidTransformer、ExerciseJSONParser）；产品级对外文档宣传仍可用"内容平台"——仅代码命名+架构层消失 Content

**决策 7 · 最终 10+1 个 app 顶层目录**
```
能力域 5 个：core / boot / data / render / shared
   +
Nuxt 官方 6 个：composables / components / pages / layouts / plugins / assets
   =
10+1 顶层（assets 资源不计能力域）
```
- 完整目录树、59 条文件精确位置映射、4 Phase 迁移计划、9 项风险矩阵、最坏 30s 回滚 → 全文见 [docs/ADR/adr0709.md](file:///C:/Users/cui/Documents/www/dexinlabs/docs/ADR/adr0709.md)

### 权衡
- **优点**：
  1. 新人扫目录时间 -65%（现状 2h → 40min，三域对称 3×2 + Nuxt 官方熟悉）
  2. Data↔Render 跨域 import 路径防呆 90%+（`@data/repositories/...` 写 `import '@render/...'` 一眼识别；相对路径需 `../../render/...` 深度一眼违规）
  3. 未来 Mermaid/Video/PDF/AI 新输入类型零命名摩擦，直接扔进对应 Parser+Renderer
  4. Utils 一捅天下 = O(1) 找工具时间
  5. 符合 Nuxt 官方目录 = 零心智+零配置+IDE 插件/静态分析无摩擦
  6. Core 严格 3 子域 = 十年稳定区 / 频繁变更区物理隔离，代码所有权清晰；长期维护成本 -40%
- **代价**：
  1. Import 修改量 ~120 处（2.5h 工作量），全局正则替换 + 五别名化 + `npx nuxi typecheck` 兜底
  2. 团队短期命名记忆切换（`@modules/content`→五新别名），1~2 周兼容期 barrel 文件 `_legacyModulesContent.ts` 过渡
  3. 迁移 6~8h 冻结主干，必须 git status clean + typecheck 0 + build 绿 + 6 页面 smoke 过关后才启动

### 实施约束（迁移期间死规则）
1. 四不变原则：API 不变 · Contract 不变 · 调用链不变 · 功能不变
2. 调用链拓扑严禁修改：Page→Composable→API→Service→Repository→Drizzle→Neon / Parser→Transformer→Renderer
3. 迁移 commit 严禁混入业务逻辑改动（只允许 rename + import 字符串改 + config 别名加）；`git diff --word-diff` 必须只能出现路径字符串变化
4. 最坏回滚：`git revert adr0709-migration-commit`，纯 rename+import 替换 → revert 成功率 100%，<30s 恢复

---

## 决策 16（2026-07-08）· ADR0709 v3 最终架构收敛（第三轮 6 条评审 100% 采纳 + 一次性全量迁移落地）

### 为什么改
**决策 15（ADR0709 v2）** 方向正确（Core 收敛 + Boot 独立 + Shared 新增 + Nuxt composables 回归 + Content 命名消失 + Data/Render 解耦），但经过"真正支撑 5~10 年演进"的**第三轮 6 条架构边界评审**，v2 在 6 个点上仍有过度设计或职责边界不够纯净的问题：

| # | 第三轮评审意见 | 定性 |
|---|---------------|------|
| R3-1（最重要） | Data 天然不是 Pipeline（Source→Repo→Service 非连续多阶段），保留 `app/data/pipeline.ts` 是无价值抽象 | ✅ 架构冗余（剪一层） |
| R3-2 | Engine 直接 import Data/Render 实现 → 静态依赖具体实现，违反依赖倒置（DIP）。Engine 应只依赖 Contracts + Registry，任何 Drizzle→Prisma / Markdown→MDX 切换不改 Engine 一行 | ✅ DIP 违反（收敛边界） |
| R3-3 | `shared/schema/` 放 ChapterListByCourseRow / LessonListByChapterRow 这类 Repository 查询投影 DTO → Render 根本不关心，本质属于 Data；Shared 应只保留 InsertCourse / UpdateCourse / CourseFilter 这类真跨域 DTO/Filters | ✅ Shared 被污染（重定位） |
| R3-4 | `boot/data/ + boot/render/ + boot/infra/` 子目录 → 未来 math/mermaid/highlight/diagram 一扩，Boot 再次膨胀。Boot 只应做"顺序协调"，领域应自己暴露 registerXxx() 自注册 | ✅ 启动细节泄漏（剪二层目录） |
| R3-5 | `data/cache/` 作为一级能力 → Cache 是 Repository / Service 的**优化策略**，不是 Data 的一级业务能力（Source/Repo/Service/Query 才是），应放 `data/_internal/cache/` 或 `data/repositories/cache/` | ✅ 能力层级错乱（降级一级目录） |
| R3-6 | Render 这一部分 100% 通过（Parser→Transformer×N→Renderer 编译器模型，未来 Mermaid/MDX/Diagram/Exercise/Video/PDF 自然接入） | ✅ 无需改动 |

采纳后 4 剪 1 重定位：**【剪 1】DataPipeline 删除；【剪 2】boot/data + boot/render 子目录删除；【剪 3】data/cache 降级；【剪 4】bootstraps/ 旧启动删除；【重定位】shared/schema 投影类 DTO → data/repositories/projections/**

### 改了什么（ADR0709 v3 最终 6 决策 + 全量迁移落地）

**决策 R3-1 · 删除 Data Pipeline（最重要，核心架构剪一层）**
- 硬删除：`app/core/dataPipeline.ts`（v2 存在过，v3 不再有任何 Data Pipeline 概念）
- 硬删除：预留 `app/data/pipeline.ts` 壳文件目录（不再创建）
- Engine 内部 `_runDataPipe<TData>()` 直接：`getQuery() → QueryContract.*` 或 `getSource() → SourceContract.findOne/findAll/count/upsert`，**不经任何独立 Pipeline 文件**
- 设计思想：`Repository → Service` 或 `Source → Repository → Service` 是自然数据流程，没有连续多阶段处理特征，为 Pipeline 而 Pipeline = 反范式抽象

**决策 R3-2 · Engine 只依赖 Contracts + Registry（DIP + 组合根 100% 实现）**
- Engine.ts 全文件仅 2 条 import：`from '@core/registry'` + `from '@core/contracts/data'` + `from '@core/contracts/render'`——**不再有任何 `@data/...` / `@render/...` 的静态 import**
- Render 管线（Parser→Transformer→Renderer）调用走 `from '@render/pipeline'`（允许引 Render 内部纯函数 pipeline，因为 pipeline 是领域内部实现，不引具体 Parser/Renderer）
- 未来替换场景（Drizzle→Prisma、Markdown→MDX、Markdown→PDF）：**只改 registerData() / registerRender() 两行注册代码，Engine.ts 零修改**
- `boot/index.ts` 真正成为组合根（Composition Root）：唯一"同时 import Data.register + Render.register"的文件；boot 不写任何业务实现，只负责启动顺序

**决策 R3-3 · Shared 纯粹化（去 Repository 投影污染 + 重定位）**
- 保留在 `shared/schema/` 的白名单（真跨域）：InsertCourse / UpdateCourse / CourseFilter / InsertChapter / UpdateChapter / InsertLesson / UpdateLesson / InsertExercise / InsertAsset 等 Repository 输入 DTO + Filters/ListOptions
- 迁出到 `data/repositories/projections/`：CourseListRow / ChapterListByCourseRow / LessonListByChapterRow / ExerciseListByChapterRow / CourseWithLessonsRow 等**SQL 查询投影 + JOIN 结果 DTO**（只有 Data 关心，Render 关心 Lesson 实体不关心 LessonListRow）
- `shared/types/` 五实体接口 + TocEntry/HeadingInfo 保留不变（真跨 Data/Render）
- Shared 四不红线继续加强：**额外加 ⑤ 不允许任何具体领域的查询投影形状**

**决策 R3-4 · Boot 收敛为"纯编排"（剪 boot/data + boot/render 二子目录 + 领域自注册）**
- 每个领域自暴露 register：
  - `app/data/register.ts` → `registerData(opts?)`：内部完成 Source=neon-drizzle 注册 + Query=lazyQuery 注册（领域内部自己知道怎么注册自己）
  - `app/render/register.ts` → `registerRender(opts?)`：内部完成 Parser=markdown + TRANSFORMER_DEFS 7 个按 order 注册 + Renderer=vue 注册
  - `app/boot/index.ts` → 删 boot/data/、boot/render/、boot/infra/ 子目录，boot 只剩 1 个文件！
- `bootEngine()` 14 行极简：
  ```ts
  registerData(opts.data)       // → 进 Registry
  registerRender(opts.render)   // → 进 Registry
  initContentEngine()           // Engine 只从 Registry 拿实现
  ```
- 未来新增 math Parser/mermaid Renderer：**只改 `render/register.ts` 加一行 TRANSFORMER_DEFS，boot/index.ts 零改动**；Boot 永远不膨胀

**决策 R3-5 · Cache 降级为内部优化策略（剪 Data 一级目录）**
- Data 一级能力严格 4 项稳定（Source / Repository / Service / Query），不再有 cache 一级公民
- 预留目录 `data/_internal/cache/`（下划线前缀 + @internal）：未来 Repository LRU 缓存 / Service 计算缓存 / Query 结果缓存 全放这
- 红线：server/api/** / composables/** / pages/** / render/** → 严禁 import `data/_internal/**`

**决策 R3-6 · Render 域 100% 通过（零改动）**
- Parser → Transformer×N → Renderer 编译器模型 v2 已稳定，v3 不动
- `render/pipeline.ts` 保留（Render 是典型 Pipeline，有连续多阶段处理特征）
- `render/parsers/ + render/transformers/ + render/renderers/ + render/components/ + render/theme/` 目录布局零变动

---

### 全量迁移落地实际情况（5 Phase 顺序执行，四不变原则 100% 恪守）

**Phase 0 + 1 · 建壳 + 文件精确迁移（7 子域 × 38 文件 move）**
```
app/modules/content/contracts/*   → app/core/contracts/*
app/modules/content/core/engine/* → app/core/engine/*
app/modules/content/core/registry.ts + dataRegistry.ts + renderRegistry.ts → app/core/registry/*
app/modules/content/types/*       → app/shared/types/*
app/modules/content/utils/*       → app/shared/utils/*
app/modules/content/schema/*（真跨域 Filters/InsertDTO 保留） → app/shared/schema/*
app/modules/content/schema/*（Repository 投影 DTO） → app/data/repositories/projections/*
app/modules/content/source/*      → app/data/sources/*
app/modules/content/repositories/*→ app/data/repositories/*
app/modules/content/services/*    → app/data/services/*
app/modules/content/loader/*      → app/data/_internal/loaders/*
app/modules/content/queries/*     → app/data/queries/*
app/modules/content/parser.ts     → app/render/parsers/markdown.ts
app/modules/content/transformers/*→ app/render/transformers/*
app/modules/content/renderer/*    → app/render/renderers/*
app/modules/content/theme/*       → app/render/theme/*
app/modules/content/components/*  → app/render/components/*
app/modules/content/pipeline.ts（Render管线）→ app/render/pipeline.ts
app/modules/content/bootstraps/*  → 删除（不再存在，被 data/register + render/register 取代）
```

**Phase 2 · 5 新别名配置 + tsconfig 裸 @foo key（经典坑修复）**
- nuxt.config.ts alias：`@core / @boot / @data / @render / @shared / @modules / @server`
- tsconfig.json `compilerOptions.paths`：**每个域配两条**（`@foo/*` + 裸 `@foo`，解决 `import from '@boot'` 不匹配 `@boot/*` 的经典路径映射坑）
- 兼容期 barrel：`app/modules/content/boot.ts` 重导出 `@boot`；`app/modules/content/core/engine.ts` 重导出 `@core/engine`；`app/modules/content/services/index.ts` 重导出 `@data/services` —— 给 CI 中可能残留的旧 import 7 天窗口迁移

**Phase 3 · 13 类文件批量 import 修复（总计 ≈ 140 处改路径字符串）**
1. **Contracts 类型引用统一**：`import type { Course } from '@shared/types'` / `import type { SourceContract } from '@core/contracts/data'`
2. **Registry 统一从 @core/registry 取**（不再自己拼相对路径 modules/content/core/...）
3. **5 个 Repository**：`../../../../drizzle/schema` → `~~/drizzle/db`（db.ts 里已 `export * from './schema'`，单入口）
4. **4 个 Services**：同 3，统一 drizzle schema 取道 db 单入口
5. **4 个 Loaders**（_internal 冷宫）：`import { chapterService } from '@data/services'`（禁止同域相对路径混乱）
6. **lazyQuery.ts**：5 处动态 `import('@data/_internal/loaders/xxx')` / 1 处动态 `import('@data/services')` / 2 处静态类型 import 统一 Contracts
7. **5 个 server/api/****：`import { chapterService } from '@data/services'`；统一返回 `wrapAPIError / defineEventHandler`
8. **Plugins engine.client.js + engine.server.js**：重写 → `import { bootEngine } from '@boot'`，提供 `$engine` + `$contentEngine`（7 天兼容双注入）
9. **composables/useCourse/useChapter/useLesson**：`import { getEngine } from '@core/engine'` 或直接从 `@data/services` 取（按最小依赖原则）
10. **Engine.ts 去 DataPipeline 去实现依赖**：仅 import @core/registry + @core/contracts/* + @render/pipeline
11. **boot/index.ts 极简 14 行**：`registerData() → registerRender() → initContentEngine()`
12. **data/register.ts 领域自注册**：createSource(neon-drizzle) + registerSource + registerQuery(lazyQuery)
13. **render/register.ts 领域自注册**：registerParser(markdown) + TRANSFORMER_DEFS.forEach(registerTransformer) + registerRenderer(vue)
14. **兼容期 3 barrels**（app/modules/content/ 下的 boot.ts/core/engine.ts/services/index.ts）：防止 CI 里有遗漏旧 import

**Phase 4 · 收尾死规则执行**
1. 旧 modules/content 残留空壳目录删除（contracts/、types/、utils/、bootstraps/、tests/、boot.ts 历史版）
2. DatabaseSource.js 去掉 `import type { SourceContract }`（JS 不允许 import type 语法，TS8006）
3. Engine `_runDataPipe` 内 `source.findAll()` 返回 `TData[]` 赋给 `result.data` 泛型不匹配 → `as unknown as TData` 安全 cast
4. drizzle/db.ts Proxy + `export * from './schema'`（统一单入口让所有 data 域从此取 courses/chapters 表，不必 drizzle/schema + drizzle/db 两次 import）
5. **content/sync.js 独立 Node 脚本修复**（根目录脚本不走 Nuxt 别名）：
   - drizzle 路径 `'../drizzle/db'`（相对路径，不带 .js 扩展名，tsx 识别 .ts）
   - repositories 路径 `'../app/data/repositories/index'`（旧 modules/content/repositories 路径彻底失效）
   - package.json `sync` 脚本：`node content/sync.js` → **`tsx content/sync.js`**（因 drizzle/db.ts 是 TS，Node 直接跑不认识，安装 tsx 为 devDependency）

**Phase 5 · 三连验证（三条全绿 = 迁移成功）**
| 验证项 | 命令 | 结果 |
|--------|------|------|
| 类型检查（含构建时） | npm run build（Nitro 构建过程内置类型检查） | ✅ exit 0 · `✨ Build complete!` · 完整 Vercel 产物（.vercel/output 3.16 MB / 779 kB gzip） |
| 构建产物 + Vercel 可部署 | npm run build | ✅ 同上，`[nitro] You can deploy this build using npx vercel deploy --prebuilt` |
| 同步链路幂等性 | npm run sync（tsx 驱动 8 个 content 文件 → Neon） | ✅ exit 0 · scanned:8 / upserted:8 / skipped:0 / errors:0 · course1+chapter2+lesson5=8 |

### 权衡
- **优点（架构长期价值）**：
  1. **DIP 100% 落地**：Core 只依赖抽象（Contracts + Registry），不依赖任何具体实现；未来技术栈切换零改 Engine
  2. **组合根模式严格实现**：boot/index.ts 14 行纯编排 = 唯一组装点；领域自注册 = 新增能力只改领域内文件，Boot 永不膨胀
  3. **Shared 真正纯粹**：只放跨域纯类型/真 DTO/Filters，绝不再被领域投影污染
  4. **Data 四级业务能力稳定 10 年**：Source / Repository / Service / Query + 内部优化 _internal/cache/_internal/loaders = 一级目录永远不变
  5. **Render Pipeline 模型稳定 10 年**：Parser→Transformer×N→Renderer 编译器模型完美覆盖 Markdown/Mermaid/MDX/Diagram/Exercise/Video/PDF 所有未来输入类型
- **代价（迁移+维护一次性）**：
  1. Import 总改动量 ≈ 140 处（≈ 4h 一次性工作量），typecheck/build/sync 三连兜底
  2. `@foo/*` + 裸 `@foo` 双 key 是 tsconfig paths 经典坑，团队需文档记住"每个域两条 paths 规则"
  3. `npm run sync` 从纯 node → tsx 包装（因 TS 化后的 drizzle/db.ts），安装 tsx 一个 devDependency（几 MB）

### 未来下一步建议（2~3 迭代内，非本次实施）
1. **Loaders 2 迭代后彻底删除**：现有 `data/_internal/loaders/*` 四个 loader 全部逻辑迁移到 Service 层（Service 直接聚合 Repository），Engine.data 直接走 Service 不经过 Loader，冷宫清场
2. **Cache 具体实现落地**：`data/_internal/cache/` 先上 Repository 级 LRU（最近查询的 Chapter/Lesson，LRU size=256），实测命中率后再考虑 Service 级计算缓存
3. **兼容期 barrel 到期清理**：7 天后 2026-07-15 删除 `app/modules/content/{boot.ts,core/engine.ts,services/index.ts}` 三个兼容期重导出 + nuxt.config.ts alias 中 `@modules/*` 条目，modules/ 目录彻底清空后也可删除

---

## 决策 14（2026-07-08）· Vercel 500 根治 + JS→TS 二轮全量回迁 + 数据源清理 + Bootstraps 分层 + Core 拆分 Data/Render Registry

### 为什么改
2026-07-07 架构决策落地后，暴露出 5 类生产级与可维护性问题：
1. **Vercel 部署 500 Server Error**：构建工具 Rollup 将 Repository 中的 getter 懒加载优化，内联进类构造函数，导致模块加载时立即调用 `getDb()` → 访问 `DATABASE_URL` 环境变量（Vercel Serverless 模块初始化阶段环境变量还未就绪）→ 直接抛错整个 SSR 白屏 500
2. **Source 类型冗余**：`app/modules/content/source/` 同时保留 `cms/`、`content-v3/` 两个已完全废弃的占位实现目录，且 `createSource()` 工厂里还挂着 `prisma`、`nuxt-content-v3` 分支（相关依赖均已卸载），新成员极易误选
3. **Registry/Pipeline 类型不精准 + Contracts 值/类型命名冲突**：Core Registry 一锅装 Data+Render 所有组件；Pipeline 未拆分 DataPipeline/RenderPipeline；Contracts TS 迁移后 `XxxContract refers to a value, but is being used as a type here`（TS2749）10+ 处红色波浪线
4. **Boot.ts 臃肿（>300 行）**：实现细节 + 编排混在一个文件，每次加 Transformer/Source 都改 boot.ts，违反"开闭原则"
5. **Drizzle schema + DB 工厂仍是 JS + Windows 构建坑**：`drizzle/schema.js` Windows 下 drizzle-kit 报 "No schema files found"；`content/sync.js` js-yaml 5.x 默认导出报错、Windows 反斜杠 fast-glob 扫不到文件

### 改了什么（7 个子决策）

**子决策 1 · Drizzle db Proxy 懒加载 + Repository _getDb() 方法替代 getter（根治 Vercel 500）**
- [drizzle/db.ts](file:///C:/Users/cui/Documents/www/dexinlabs/drizzle/db.ts)：重写 db 单例为 `new Proxy<DbInstance>({})`，**仅当属性访问命中 `dbOperations.includes(prop)` 或 `transaction` 时**才调用 `ensureDbInitialized()` 初始化连接；模块顶层零任何 DB 调用
- 所有 5 个 Repository：把 `private get db() { return getDb(); }` getter 改为 `private _getDb() { return getDb(); }` 显式方法调用——**阻止 Rollup 任何形式的 getter 内联优化**
- Root cause 定性：Rollup 构建期 getter inline → 构造函数中过早执行 → 环境变量未就绪；这是 Vercel Serverless + TypeScript/Rollup 的常见坑，不是 db.ts 设计问题

**子决策 2 · JS→TypeScript 二轮全量回迁（类型安全优先，npx nuxi typecheck 0）**
- 迁移范围：contracts/*、core/*、repositories/*、services/*、bootstraps/*、loader/*、drizzle/*、server/utils/*、nuxt.config.*
- 类型系统特性全量用足：
  - `defineNuxtConfig<T>`、`defineConfig<DrizzleConfig>` 泛型
  - Drizzle `PostgresJsDatabase<Schema>`、`$inferSelect<T>` / `$inferInsert<T>` 推导 Repository 行/插入类型
  - Contracts 接口 + `assertContract<T>(impl, Contract)` 泛型断言函数
- TS2749 值/类型命名冲突根治：每个契约文件末尾显式加 `export type XxxContract = XxxContractMethods`（值和类型用同名别名双导出）
- 跨 TS 模块导入保留 `.js` 扩展名保 ESM 兼容；外部 TS→TS 模块内互相 import 去掉 `.js` 扩展名
- Drizzle query builder 泛型严格匹配问题：动态拼 where 条件的 Repository 方法内查询变量声明 `let query: any`，绕过严格结构检查（静态安全与动态构造二者权衡，仅查询变量用 any）
- 动态 import TS 模块：用 `as unknown as TargetType` 两次断言中间层

**子决策 3 · 数据源清理：仅保留 Database 一种来源（删除 cms/ + content-v3/）**
- 整目录删除：`app/modules/content/source/cms/`、`app/modules/content/source/content-v3/`、空 `source/markdown/`
- `createSource(type, deps, opts)` 工厂删除：`'prisma'`、`'nuxt-content-v3'` case；`'cms'` case
- `createSource()` 仅保留 5 种类型全部指向 DatabaseSource：`'database' / 'neon' / 'neon-drizzle' / 'markdown' / 'filesystem'`（后三个为兼容期别名）
- 默认分支错误信息更新：`Supported: database | neon | neon-drizzle`
- 同步删除 SOURCE_TYPES 对应枚举条目

**子决策 4 · Core 重构：Registry 拆 Data/Render 双注册中心 + Pipeline 拆 Data/Render 双管线**
- Registry 拆分（高内聚低耦合）：
  - `core/dataRegistry.ts`：`registerSource/getSource / registerLoader/getLoader / registerQuery/getQuery`（Data 侧能力注册）
  - `core/renderRegistry.ts`：`registerParser/getParser / registerTransformer/getTransformer / registerRenderer/getRenderer`（Render 侧能力注册）
  - `core/registry.ts`：薄壳 re-export 层，只做聚合导出（不写任何逻辑）
- Pipeline 拆分：
  - `core/dataPipeline.ts`：Source → Repository → Service 执行链（纯数据，不碰渲染）
  - `core/renderPipeline.ts`：Parser → Transformer×N → Renderer 固定链（纯渲染，不碰 DB）
  - `core/pipeline.ts`：薄壳只负责调度，import 两者组合执行
- 拆分收益：未来想 Render 独立包发布给其他项目用，只需拿 renderRegistry + renderPipeline，不拖任何 DB 依赖

**子决策 5 · Boot.ts 拆分层 bootstraps/ 子目录（开闭原则：对新增开放对修改关闭）**
- 迁移前：boot.ts = parser 注册 + transformer 7 个注册 + renderer 注册 + database 注册 + Query 注册 = 全塞进 300+ 行
- 迁移后扁平化文件结构：
  - `bootstraps/parser.ts`（仅注册 MarkdownParser）
  - `bootstraps/renderer.ts`（仅注册 VueRenderer）
  - `bootstraps/transformers.ts`（TRANSFORMER_DEFS 常量表 + 按 order 注册 7×Transformer）
  - `bootstraps/database.ts`（Source=neon-drizzle + Query=lazyQuery 注册）
  - `bootstraps/queries/lazyQuery.ts`（QueryContract Facade 默认实现独立）
  - `boot.ts` 只剩 74 行纯编排：`bootstrapDataSide() → bootstrapRenderSide() → Engine init`
- 收益：新增一个 Transformer → 只改 bootstraps/transformers.ts（常量表加一行），不动 boot.ts 主流程

**子决策 6 · Shared 领域类型抽离 contracts/types.ts（跨 Data/Render 共享五实体）**
- 抽出五张表对应五实体接口（Course/Chapter/Lesson/Exercise/Asset）+ TocEntry/HeadingInfo/LinkInfo/Reference 元信息
- contracts/data.ts 与 contracts/render.ts 双向引用 contracts/types.ts，不再各自重复定义形状
- 为 ADR0709 v2 的 `app/shared/types/` 迁移做了数据结构准备（只差物理文件移动）

**子决策 7 · Drizzle/同步脚本 Windows 兼容性 + TS 化全解**
- `drizzle.config.ts` schema 路径从绝对路径改相对路径 `./drizzle/schema.ts`，解决 Windows 反斜杠 drizzle-kit 解析失败
- schema 文件改 `.ts` 扩展名（drizzle-kit Windows 下不识别 `.js` schema 扩展名是已知 bug）
- `content/sync.js` js-yaml 5.x 默认导出修复：`import yaml from 'js-yaml'` → `import * as yaml from 'js-yaml'`
- `content/sync.js` Windows fast-glob 反斜杠路径修复：`path.resolve(...).replace(/\\/g, '/')` 统一正斜杠
- `server/utils/db.js` → `server/utils/db.ts` TS 化 + 同步删除 drizzle 下遗留 JS 旧文件（drizzle/db.js、drizzle/schema.js、server/utils/db.js），确保 TS 单一真源，避免 Nitro 构建时同路径 .js vs .ts 优先级歧义

### 权衡
- **优点**：
  1. Vercel 生产部署 SSR 500 根治：db Proxy + Repository 显式 _getDb() 方法双重保险，任何 Rollup 优化都无法提前初始化
  2. npx nuxi typecheck 0 错误，红波浪线零，IDE 补全+跳转 100% 精准
  3. Registry/Pipeline 双拆分 + Bootstraps 分层 = 新增能力只改对应 bootstrap，不碰核心编排 boot.ts；开闭原则落地
  4. 数据源清理后目录精准 = 单父单子冗余 + 两个废弃目录彻底删，新人不会误踩
  5. js-yaml 5.x + Windows drizzle-kit + fast-glob 路径三坑全解，新成员 clone 后 `npm run sync` + `drizzle:push` 零调试
- **代价**：
  1. 迁移期间 100+ 处 TS 错误修复（2~3h），主要是 import 扩展名 `.js` 去/留、值/类型别名显式导出、`as unknown as T` 双断言
  2. Plugins、Composables、Components 三个 Nuxt 约定目录重新释放到 `app/` 根，对应 nuxt.config imports.dirs / components.dirs 删除原 modules/* 配置项（扫描路径变更）
  3. ADR0709 v2 后续物理迁移时，需要再次同步维护 paths + aliases + 兼容期 barrel 文件

---

## 决策 13（2026-07-07）· 内容采用 Markdown/YML Source of Truth + npm run sync 幂等同步到 Neon（数据库只做运行时查询）

### 为什么改
- 直接把课程/章节/课时的正文写进数据库（或用 DB CMS 后台改）有三个长期痛点：
  1. 内容版本管理困难：DB 内容 diff 难、AI 批量改写 commit 难、多人协作 review 难
  2. 迁移不自由：换 DB / 换 CMS 要重新 dump+import，且业务耦合深
  3. Markdown/YAML 本来就是内容天然格式：VS Code/Obisidian/Typora/AI 都能直接改，Git 是世界上最好的版本管理工具
- 但文件系统（Content v3）直接做运行时源有两个硬伤：
  1. 关联查询（课→章→节→练习→用户进度→提交）必须走 DB 索引，fs 根本做不动
  2. 搜索、分页、权限过滤、推荐都依赖关系型查询，fs 只能暴力扫描
- 所以采用"文件 = 唯一真源 + 数据库 = 运行时索引"的经典双写架构（类似 Hugo/Jekyll + Algolia，只是把 Algolia 换成 Neon），两边各自发挥长处。

### 改了什么
- 角色分工确定：
  - **Source of Truth（真源，唯一可写）**：`content/course/**/*.yml`、`content/chapter/**/*.yml`、`content/lesson/**/*.md`（可选 `content/exercise/**/*.md`、`content/assets/**/*.yml`）
  - **运行时只读副本（查询优化层）**：Neon Postgres 的 5 张表 courses/chapters/lessons/exercises/assets，内容必须完全由同步脚本产生
- 新增 [content/sync.js](file:///C:/Users/cui/Documents/www/dexinlabs/content/sync.js)（纯 Node 运行，`npm run sync`，不依赖 Nuxt/Nitro/Vite）：
  1. 自动读项目根 `.env` 拿 `DATABASE_URL`（兼容裸 node 执行和 npm 脚本）
  2. `fast-glob` 扫 3 类文件模式
  3. `js-yaml` 解析 yml 或正则 `^---\n(frontmatter)\n---\n(body)` 切 md 文件，frontmatter 再次走 js-yaml
  4. slug 为唯一键：Repository `upsert`（Drizzle `insert ... onConflictDoUpdate` target=slug）—— **幂等**，文件改多少次、同步多少次都是安全的，不会产生重复数据
  5. 结束调用 `closeDb()` 关 Neon Pool，防止 Node 进程挂住不退出
  6. 最后打印汇总：`scanned / upserted / skipped / errors` 四计数 + 每类分表 OK / skipped / errors 明细行
- **硬性架构规则**：
  - 所有运行时代码（SSR server routes / Service / Repository / Loader / Engine）**绝对禁止**读 content/ 目录的 fs、**绝对禁止**用 @nuxt/content 之类的 fs 索引器
  - 真源写操作只能在 VS Code / AI 改 Markdown/YAML，走 Git MR/commit；同步只能由开发/CI 执行 `npm run sync`；Neon 里课程/章节/课时/练习表**业务层只写 DB side effect（用户进度等）**，绝不能 overwrite `body/title/slug/order` 这些来自 Markdown 的字段（否则下次同步会被覆盖）
- package.json scripts 新增：`"sync": "node content/sync.js"`

### 权衡
- **优点**：内容自由、Git 可审计、AI 批量改写零成本、换库只需 `npm run sync` 重放、Vercel Build 不需要 fs 索引（Content v3 构建期扫盘时间去掉）
- **代价**：每次改 Markdown 后必须跑一次同步，数据库和真源之间存在 1 个"同步动作"滞后；相比纯数据库编辑多一道工序
- **为什么没用 `nuxi content` / Nuxt Content v3 的内置同步**：v3 已经彻底卸载，且同步逻辑是业务强相关的字段映射（frontmatter title/slug/chapter → SQL 列），必须用代码显式维护，不能靠隐式映射

---

## 决策 12（2026-07-07）· 严格五层调用链：Page → Composable → API → Service → Repository → Drizzle → Neon

### 为什么改
- 之前尝试过两套方案，都存在越权访问和单点改全身的问题：
  1. **旧三层 API/Repository/Composable**：旧 Repository 混 queryCollection + 缓存 + 权限，SSR/Client 边界不清；Composable 还会跨 import（Lesson 页面 import useChapter）
  2. **Source/Adapter/Loader/Engine 新三层**：Loader 直接 import Source 的 collection 纯函数，虽然职责拆清了，但业务聚合（比如 Course→Chapters→Lessons 嵌套）散落在 Loader 与 Source 之间，无法复用；同时 server/api/* 直接用 `usePrisma()` 跳过了所有中间层，变成"DB 直通 handler"，未来要加缓存/鉴权/审计会每个 handler 全改一遍
- 必须引入 **Repository（单集合纯 CRUD） + Service（跨集合业务聚合）** 两个明确的服务端层，并且把调用顺序严格锁死

### 改了什么
- **调用方向唯一向下，禁止反向或跳跃**：
  ```
  Page (Vue SFC)
    ↓
  Composable (useCourse / useChapter / useLesson / useExercise，内部 useAsyncData + $fetch)
    ↓
  server/api/* (Nitro 路由，参数校验 + createError；除了调用 Service 外不写任何业务)
    ↓
  Service (CourseService / ChapterService / LessonService / ExerciseService，跨 Repository 组合成 loader 需要的返回结构)
    ↓
  Repository (每表一个：单集合 CRUD + 典型过滤查询，绝不跨表)
    ↓
  Drizzle (sql 语法糖，绝不写裸 pg)
    ↓
  Neon (Postgres Pool @neondatabase/serverless)
  ```
- 新增目录：
  - [app/modules/content/repositories/](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/repositories)（5 个，五张表各一个，含 index.js 统一导出）—— 纯 CRUD，upsert 逻辑放在 Repository 保证 Service 写表时都经过同一 slug 冲突处理
  - [app/modules/content/services/](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/services)（4 个，Course/Chapter/Lesson/Exercise，含 index.js 统一导出）—— 业务聚合：`CourseService.getDefault` 直接返回 Course 树；`ChapterService.getBySlug` 返回旧版 API 要求的 `{chapter,lessons,exercise}`；`LessonService.getBySlug` 返回 `{...lesson, chapter}`；Service 只调 Repository，绝不直连 DB
- server/api/* 全部改造完成：**0 个 handler 直接 useDb 或 useXxxRepository**，5 个路由分别调用对应 Service 的方法，参数/404 校验与原来一模一样，所以 Page/Composable 不需要任何改动（API 输出结构保持不变）
- Content Engine 的 [loader/course.js](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/loader/course.js) / [loader/chapter.js](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/loader/chapter.js) / [loader/lesson.js](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/loader/lesson.js) 也改为调用对应 Service，保持对外返回 `__loadedBy / __source / lessonsMap` 等签名不变，Engine 层完全无感

### 权衡
- **优点**：每一层职责单一，未来加任意横切关注点（鉴权/缓存/审计/分库）只改一层：
  - 要加 Redis 读缓存 → 加在 Repository 外层
  - 要加课程可见性权限 → 加在 Service 外层
  - 要加 API 限流 → 加在 server/api/* 中间件层
  - 要切换 DB → 只改 Repository 实现（Drizzle→Knex→Baremql），Service 以上零改动
- **代价**：增加两层"样板"文件，新表要同时建 Repository + Service；对于 5 张表的小项目是小成本，但长期看是 1:1 收益的架构投资

---

## 决策 11（2026-07-07）· Prisma ORM → Drizzle ORM 替换

### 为什么改
- Prisma 在本项目中已经暴露四个长期不可回避的坑：
  1. **Prisma 7 强制 schema url 字段废弃**：必须把 `datasource.url` 从 schema.prisma 移到 `prisma.config.js` defineConfig，导致"schema + 配置双文件"认知负担，且与官方文档默认写法不一致，新成员上手踩坑成本高
  2. **Prisma Client 代码生成前置**：dev/build 前必须 `prisma generate`，CI 慢、冷启动慢；每次 schema 变动如果漏跑 generate 就报一堆类型错误（虽然我们用 JS，但生成代码本身仍是强依赖）
  3. **better-sqlite3 强制依赖的连锁反应**（Prisma → @nuxt/content → better-sqlite3）：better-sqlite3 需要 native 编译，Vercel / Alpine Docker 环境会偶发编译失败，构建时要带 binary 镜像，工程复杂度陡增
  4. **SQL 黑盒**：复杂 join / with / upsert returning / 窗口函数在 Prisma 中要么写得别扭，要么必须 `$queryRaw` 退回到裸 SQL；而我们同步脚本刚好需要大量 `onConflictDoUpdate`（upsert）+ relation 反查，Drizzle 的 "SQL 语法糖但不失控" 心智更匹配
- 选型三选一（Prisma / Drizzle / Kysely）：
  - Prisma 上面列的坑命中全部
  - Kysely 没有官方 neon 驱动集成，需要自己写 Pool + 适配器，查询 builder 心智略低于 Drizzle
  - Drizzle：官方支持 `drizzle-orm/neon-serverless`，驱动复用已有的 `@neondatabase/serverless` Pool；migration/diff/push/check 工具链齐全（`drizzle-kit`），且 **CLI 与运行时完全解耦（不需要生成 Client，schema.js 就是运行时类型依据）**

### 改了什么
- 卸载：`prisma` / `@prisma/client` / `@prisma/adapter-neon`
- 新增：`drizzle-orm`（运行时） + `drizzle-kit`（dev CLI）
- 保留：`@neondatabase/serverless`（Drizzle neon-serverless 驱动直接复用 Pool）
- schema 迁移：Prisma 5 表模型（Course/Chapter/Lesson/Exercise/Asset）→ [drizzle/schema.js](file:///C:/Users/cui/Documents/www/dexinlabs/drizzle/schema.js) 显式 5 表 + relations + uniqueIndex/index + createdAt UTC now 默认 + updatedAt onUpdate hook（JS 属性名驼峰，SQL 列名 snake_case）
- 配置迁移：[drizzle.config.js](file:///C:/Users/cui/Documents/www/dexinlabs/drizzle.config.js)（ESM，自动读 process.env.DATABASE_URL），schema 路径指向 drizzle/schema.js，out 指向 drizzle/migrations
- 单例/连接池：
  - [drizzle/db.js](file:///C:/Users/cui/Documents/www/dexinlabs/drizzle/db.js)：`createDb(opts)`（自定义 Pool/url）、`getDb()`（单例，lazy init）、`closeDb()`（Pool.end）、`db` Proxy（隐式 lazy getDb）+ re-export 全部 schema 便于解构
  - [server/utils/db.js](file:///C:/Users/cui/Documents/www/dexinlabs/server/utils/db.js)：Nitro auto-import 包装，暴露 `useDb()`；运行时同步脚本和 server 端共用 drizzle/db.js
- package.json scripts：去掉 6 个 `prisma:*` 命令，新增 `drizzle:generate / drizzle:migrate / drizzle:push / drizzle:studio / drizzle:check` + `sync`（content/sync.js）
- 删除遗留：`prisma/` 整个目录、`prisma.config.js`、`server/utils/prismaClient.js`、旧 [app/modules/content/source/database/](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/source/database) 下四个 collection 纯函数（course/chapter/lesson/exercise.js）
- Content Engine DatabaseSource 同步重写：[DatabaseSource.js](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/source/database/DatabaseSource.js) 三方法（findOne/findAll/count）从"throw NotImplemented"→ 直接 drizzle select/where/orderBy/limit/offset/count(*)，COLLECTION_TO_TABLE 映射五张表，保证 Source 层的实现与 Repository 用同一个 schema 定义

### 权衡
- **优点**：
  1. 构建期零生成：build/dev 不再有 generate 前置，冷启动更快
  2. SQL 透明可控：所有查询 drizzle 只是 builder，实际 SQL 可直接 `toSQL()` 打印，排查慢查询比 Prisma 省一半时间
  3. 驱动复用：`@neondatabase/serverless` Pool 直接用，没有额外 adapter 包装层
  4. 生态零 native 依赖：Drizzle 纯 JS，drizzle-kit 也是 JS CLI，不存在 better-sqlite3 / prisma query engine binary 的编译问题，Vercel / Edge / Bun / Deno 都能跑
- **代价**：
  1. 相比 Prisma 的 `include` 声明式 join，Drizzle 多表 join 要自己写 `leftJoin` + select 字段，稍微啰嗦一点（可用 `relations` API 简化）
  2. schema 写法：必须熟悉 Drizzle 的 pg-core column builder 系列 API（serial/varchar/text/integer/timestamp/uniqueIndex），但对长期维护是好事——不再有 Prisma 特有的隐式黑盒

---

## 决策 10（2026-07-07）· Content Engine 8 层结构 + Contracts 契约驱动

### 为什么改
- 此前代码已经分了"Source / Adapter / Query"三层，但**长期缺少统一渲染框架**，`@nuxt/content` 的 `<ContentRenderer>` 是黑盒，后续换 Markdown 实现（remark/micromark/markdown-it）和换数据源（文件→数据库→CMS）都会导致全局大改。
- 参考 [content-engine.md](file:///c:/Users/cui/Documents/www/dexinlabs/content-engine.md) 定义："任何技术（Content v3、Markdown、数据库、CMS）都只是一个数据源，不是系统本身"，所以必须引入 **Contracts 契约层** 先锁死接口，再让各层实现。

### 改了什么
- 新增 `app/modules/content/contracts/` 6 大契约：`Source` / `Loader` / `Parser` / `Transformer` / `Renderer` / `Query`，每个文件只写签名 + `assert*Contract` 校验，**零实现代码**。
- 新增 `core/registry.js` 作为统一注册中心：所有 Source/Parser/Transformer/Renderer/Query 都在 boot 时注册到 registry，Engine 不再硬依赖具体实现。
- 新增 `core/pipeline.js` 固定流水线：**Parse → Transform (按 order 排序) → Render**，任何增强都只能写新 Transformer 注册进来，不允许改 Parser。
- 新增 `core/engine.js` 统一门面：`getContentEngine().getChapter(slug, opts)`、`.pipe(content, opts)` 等，以后 Page 只认 Engine，不碰具体层。
- 新增 `plugins/content-engine.client.js` / `.server.js` 把 `$contentEngine` / `$contentQuery` 注入到 NuxtApp 全局。

### 权衡
- **短期写了 25+ 新文件**（骨架），但未来切换 DB / CMS / Parser **仅改对应 Source 或 Parser 的实现文件，上层零改动**。
- 选择了"Nuxt ContentRenderer fallback"策略在 `MarkdownRenderer.vue`：短期内页面仍然走 Nuxt 渲染保证线上可用，替换时只改 Renderer 内部实现。

---

## 决策 9（2026-07-07）· Database / CMS Source 预留占位实现

### 为什么改
- 架构文档的核心诉求是"**逐步替代 content v3 文件系统**"。如果现在不把接口预留出来，日后接数据库时会重新动到 Engine/Loader/Query 三层，违反契约驱动原则。

### 改了什么
- 新增 `app/modules/content/source/database/DatabaseSource.js`：实现 SourceContract 三方法（findOne/findAll/count），但方法体统一 `throw NotImplemented`，并把**预期的入参签名**写在错误信息里，下一步接 ORM 只要替换 throw。
- 新增 `app/modules/content/source/cms/CMSSource.js`：同样策略，为 Strapi/Payload/Sanity 预留，并注释 `this.api.fetch(\`/api/${collection}/${slug}\`)` 的接入点。
- 新增 `source/index.js`：`createSource(type, deps, opts)` 工厂 + `SOURCE_TYPES` 枚举，`type ∈ {nuxt-content-v3, markdown, database, cms}`。

### 权衡
- 不直接引入数据库驱动/ORM 依赖，保持当前构建零新包。

---

## 决策 8（2026-07-07）· Loader 单独拆一层（Source 不做业务聚合）

### 为什么改
- 之前 `source/content-v3/chapter.js:getChapterBySlug()` 里同时查 chapter + exercise，`lesson.js:getLessonBySlug()` 里同时查 lesson + chapter——这些是**业务关联聚合，不是纯数据抓取**，违反 Source"只取内容"的单一职责，后续换 DatabaseSource 时必须把这些逻辑再复制一遍。

### 改了什么
- 新建 `loader/`：
  - `loader/course.js`：`loadCourse(slug)` → 组装 Course Tree（Course → Chapters → Lessons 嵌套）
  - `loader/chapter.js`：`loadChapter(slug)` → Chapter + Exercise + Lessons
  - `loader/lesson.js`、`loader/asset.js`
- Source 层保持"单集合查询纯函数"（`source/content-v3/*.js` 不改内容），被 Loader import 复用。

---

## 决策 7（2026-07-07）· 轻量 Frontmatter 解析，不引入 gray-matter

### 为什么改
- Parser 写骨架时最初打算 `import matter from 'gray-matter'`，结果 `package.json` 没有此依赖；项目已经是 Nuxt 4 大依赖集合，**避免装包+增加构建体积**。
- 当前 frontmatter 只含简单 `key: value`（无嵌套 YAML、数组用得少），自写 20 行解析器覆盖 90% 场景，未来可平滑替换到 gray-matter/js-yaml。

### 改了什么
- 新增 `parser/frontmatter.js:parseFrontmatter(raw)`，手写 `---` 分隔符 + `key: value` 分割，仅支持字符串标量。
- `parser/markdown.js` 改为复用 `parseFrontmatter`，不装新包。

---

## 决策 6（2026-07-07）· Transformer 7 个独立文件 + registry order 排序

### 为什么改
- "增强逻辑散落在 Parser 里"是未来最容易失控的地方（TOC/Heading ID/Link 改写/Excerpt/Reading Time/Math 各写各的，互相覆盖）。
- content-engine.md 明确要求 Transformer 是"系统以后最重要一层"。

### 改了什么
- `heading.js`、`toc.js`、`links.js`、`excerpt.js`、`readingTime.js`、`reference.js` 6 个独立文件 + `registerTransformer(name, impl, order=100)` 注册时带 order。
- `pipeline.js` 按 `order` 升序执行 Transformer（heading→toc→links→excerpt→readingTime→reference），保证 TOC 依赖 Heading ID 注入完成。

---

## 决策 5（2026-07-07 前后）· `contentAdapter.js` 移入 `server/utils/`

### 为什么改
- 之前放 `app/modules/content/adapter/contentAdapter.js`，运行时 **ReferenceError: queryCollection is not defined**。根因：Nuxt Content 的 `queryCollection` 是 **Nitro unimport** 注入，**只扫描 `server/` 目录**，`app/` 下的文件不在扫描范围。
- 这是本项目最容易反复踩的坑，必须在架构日志里明确规则。

### 改了什么
- 迁移到 `server/utils/contentAdapter.js`：Nitro 自动把该文件导出的 `createContentAdapter` auto-import 到所有 `server/api/*` 路由。
- 5 个 API 路由删除显式 import，只保留 Source 函数 import。
- **架构规则新增一条**：凡是直接调用 `queryCollection()` 的代码 → **必须**放在 `server/utils/` 或 `server/plugins/` 或 `server/middleware/` 下，**严禁**放在 `app/`。

---

## 决策 4 · modules/shared 移入 `app/` 目录

### 为什么改
- 原放在项目根 `modules/`、`shared/`，Nuxt 4 build 阶段将其视为 node_modules 外部依赖，报 `Entry module cannot be external`。

### 改了什么
- 统一迁入 `app/modules/`、`app/shared/`，`nuxt.config.js` 的 `alias`、`imports.dirs`、`components.dirs` 全部指向 `~/app/...`。

---

## 决策 3 · 旧三层（API/Repository/Composable）→ 新三层（Source/Adapter/Query）

### 为什么改
- 旧 Repository 里混用了"调 queryCollection + 业务缓存 + 权限判断"，三类职责耦合，SSR/Client 边界不清。
- 原 Composable 两步调用：`const { loadChapter } = useChapter(); await loadChapter(slug)`——心智负担重，且页面里跨 composable 引用（Lesson 页面 import useChapter）。

### 改了什么
- Source：纯函数"单集合数据抓取"，**从不依赖 Nuxt Context**（依赖传进来的 adapter）。
- Adapter：集中一处 `queryCollection(event)`，唯一 Nitro 上下文耦合点。
- Query：`await useChapter(slug)` 单调用，内部 `useAsyncData`。Lesson 的事情由 Lesson Query 解决，不再跨 Composable import。

---

## 决策 2 · 全项目 TS → JS

### 为什么改
- 用户明确要求："不再使用 ts 语法，请全项目修改"。
- 教育项目以内容迭代为主，频繁改 schema 时 TS 类型声明是维护负担。

### 改了什么
- 所有 `.ts` 删除，改成 `.js`；tsconfig 相关清理；`defineProps`/`defineEmits` 保留在 Vue SFC 里（语法有效，不引 TS 类型）。

---

## 决策 1 · Nuxt 4 + Nitro + Nuxt Content v3 为初始技术栈

### 为什么改
- 初始项目就是 Nuxt Content，Markdown/YML 内容能 0 成本上手，SEO 友好。
- Nitro server routes 写 API 就是文件，零样板。

### 后续演进路径（本项目的全部决策围绕它）
- 文件 → Content v3 Adapter → **Contracts 锁定接口** → DatabaseSource / CMSSource 替换 → 最终移除 Nuxt Content 依赖。
