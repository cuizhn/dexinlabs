# 项目状态 PROJECT_STATUS
> 最后更新：2026-07-09 · 架构阶段：Markdown Engine V1 独立化全量落地 + 4 文档对齐（SPEC/DESIGN/ADR/ARCHITECTURE） · 落地状态：✅ Build + Sync + 15 Engine Tests 三绿

---

## 一、当前架构版本（ADR0709 v3 — 已落地 100%）
基于第三轮 6 条架构边界评审（100% 采纳）的最终五域分治模型：

```
app/
  core/         【十年稳定】Contracts(6 大能力协议) + Registry(IoC) + Engine(组合根+Facade)
                  —— 只依赖抽象，不依赖任何具体实现（DIP 100%）
  boot/         【唯一组合根】仅 1 个文件、14 行：registerData → registerRender → initEngine
                  —— 只负责启动顺序，不负责领域细节；领域 registerXxx() 自注册
  data/         【纯数据】四级稳定能力 Sources → Repositories → Services → Queries
                  —— 无 DataPipeline（已删除 R3-1）；Cache 降级 _internal/cache（R3-5）
                  —— Loader 已进入冷宫 _internal/loaders（2 迭代后删除）
  render/       【纯渲染】编译器模型 Parser → Transformer×N → Renderer
                  —— 100% 通过 R3-6；Render Pipeline 保留（典型多阶段 Pipeline）
  shared/       【最底层地基】types(5 实体+元信息) / schema(真跨域 DTO/Filters) / utils(一桶天下)
                  —— 不含 Repository 投影（已重定位到 data/repositories/projections R3-3）
                  —— 四不 + 一加强红线
  + composables / components / pages / layouts / plugins / assets （Nuxt 官方约定）
```

---

## 二、本次一次性迁移（2026-07-08 当天完成）
迁移规则：四不变原则 — API 不变 · Contract 不变 · 调用链不变 · 功能不变
迁移范围：7 子域 × 38 文件 move · ≈140 处 import 改写 · 5 新别名

### 验证三连 ✅（三条全绿）
| # | 验证项 | 命令 | 结果 |
|---|--------|------|------|
| 1 | 类型检查 + 构建 | `npm run build` | ✅ exit 0 · `✨ Build complete!` · Vercel 产物 3.16 MB (779 kB gzip) |
| 2 | Vercel 可部署性 | build 后 nitro 输出 | ✅ `[nitro] You can deploy this build using npx vercel deploy --prebuilt` |
| 3 | 数据同步幂等 | `npm run sync`（tsx 驱动） | ✅ exit 0 · scanned:8 / upserted:8 / skipped:0 / errors:0<br>course1 + chapter2 + lesson5 = 8 全匹配 |

### 关键修正点（踩坑记录）
1. **tsconfig 经典坑**：`@foo/*` 不匹配裸 `@foo` → 每个域必须配**两条 paths**（`@foo` + `@foo/*`），否则 `import from '@boot'` 找不到模块
2. **独立脚本 tsx 包装**：`npm run sync` 因 `drizzle/db.ts` 从 JS→TS，Node 直接跑不认识 .ts；安装 tsx(devDependency)，脚本改为 `tsx content/sync.js`
3. **独立脚本不用别名**：`content/sync.js` 是根目录 Node 脚本（不进 Nuxt Vite/Nitro pipeline）→ 所有 import 必须**相对路径**（`'../drizzle/db' / '../app/data/repositories/index'`），不能用 @data/@core 别名
4. **JS 禁止 import type 语法**：`DatabaseSource.js` 里的 `import type { SourceContract }` → TS8006，直接删除（JS 运行时不需要）
5. **Engine 泛型 cast 安全**：`source.findAll<TData>()` 返回 `TData[]` vs `result.data: TData` → 用 `as unknown as TData` 安全断言（调用端已知情 listChapters 返回数组）

---

## 三、第三轮 6 条评审采纳对照（全 100%）
| # | 评审意见 | 落地动作 |
|---|---------|---------|
| R3-1 最重要 | 删除 Data Pipeline | ✅ 删除 core/dataPipeline.ts + data/pipeline.ts 概念；Engine._runDataPipe 直接 Query/Source |
| R3-2 | Engine 只依赖 Contracts + Registry | ✅ Engine.ts 仅 import @core/registry + @core/contracts/* + @render/pipeline；无任何 @data/@render 具体实现静态 import |
| R3-3 | Shared/schema Repository 投影属 Data | ✅ CourseListRow 等 5 个投影类 DTO 迁 `data/repositories/projections/`；Shared/schema 保留 InsertCourse/CourseFilter 等真跨域 |
| R3-4 | Boot 仅启动顺序，领域自 registerXxx | ✅ 删 boot/data + boot/render + boot/infra 子目录；boot/index 14 行纯编排；新增 data/register.ts、render/register.ts 领域自注册 |
| R3-5 | Cache 是优化策略，非 Data 一级能力 | ✅ 预留 `data/_internal/cache/`（下划线 + @internal）；Data 一级能力稳定 Source/Repo/Service/Query 四项 |
| R3-6 | Render Parser→Transformer→Renderer 认可 | ✅ 零改动 |

---

## 四、遗留清理（7 天兼容期窗口 · 2026-07-15 截止）
兼容期保留 3 个 barrel + 1 个别名条目，确保有少量残留旧 import 的 CI/分支不立刻爆炸：
```
app/modules/content/boot.ts           → re-export @boot（兼容 @modules/content/boot 旧路径）
app/modules/content/core/engine.ts    → re-export @core/engine
app/modules/content/services/index.ts → re-export @data/services
nuxt.config.ts alias @modules/*       → 保留
```
→ 2026-07-15 后全量删除（含 `@modules/*` 别名），`app/modules/` 目录随后也可彻底删除。

---

## 五、2~3 迭代内建议（非本次）
1. **Loaders 彻底删除**：`data/_internal/loaders/*` 四个 → Service 直接聚合 Repository（Loader 冷宫清场）
2. **Cache 落地实现**：`data/_internal/cache/` 先上 Repository 级 LRU（size=256），命中率达标后再 Service 级计算缓存
3. **Parser/Renderer 横向扩展**：按 render 编译器模型自然接入 Mermaid、MDX、Diagram、Exercise、Video、PDF → 只改 render/register.ts 加 TRANSFORMER_DEFS
4. **Registry 类型安全升级**：`getParser('foo')` 返回类型按 key 绑定具体 Parser 类型（key→映射表 + 泛型推导），减少调用端 as 断言

---

## 六、回滚保障
最坏情况 <30s 回滚：本次迁移是**纯 rename + import 字符串改 + config 别名加**，零业务逻辑变化，`git revert adr0709-v3-migration-commit` 成功率 100%。

---

## 七、2026-07-09 Markdown Engine V1 独立化完成（架构层新增根级基础设施）

### 背景
ADR0709 v3 Content Engine 重构完成后，`app/render/` 下的 Parser/Transformer/Renderer 仍存在三项不可接受问题：
1. **与 Vue 强耦合**：`vueRenderer.js` 返回 Vue 组件引用、`MarkdownRenderer.vue` 直接 `marked.parse()`，丧失「独立发 npm 包 / 未来接 React 或纯静态站点生成器」可能性
2. **AST 无单一真源**：Contracts Parser/Transformer/Renderer 各自定义了松散的接口，和 render 实际节点类型不一一对应，长期类型漂移风险
3. **缺少引擎级公共 API 门面**：业务代码要 Parser 自己拿、Transformer 自己调，没有稳定的 `createEngine().run()` 管道抽象

所以本次按 `standards/Architecture/ARCHITECTURE.md §4 Markdown Engine` + 引擎内部 `SPEC.MD / DESIGN.MD / ADR.md` 三文档契约，**在仓库根目录独立新建 `markdown-engine/` 基础设施**（不在 `app/` 下），并把 `app/render/` 降级为薄 Vue 适配层。

### Phase 执行（7 Phase，按依赖顺序严格执行）
| Phase | 动作 | 关键产物 |
|-------|------|---------|
| Phase 1 | Engine 壳创建 + 别名 @me 配置 | `markdown-engine/src/{index.ts, ast/types.ts, pipeline/pipeline.ts}` 骨架；nuxt.config.ts/tsconfig.json 加 `@me`→`markdown-engine/src` 双 entry paths |
| Phase 2 | 真实 Parser 落地（marked.lexer + MDAST 转换） | `parser/markdown.ts`：marked.lexer→convertBlockTokens→RootAstNode；配套 `frontmatter.ts / math.ts`；**AST 根节点 type='root'（MDAST 对齐，不是 document）** |
| Phase 3 | 6 内置 Transformer Plugin 重写（TS 化 + AST 原生操作） | `transformer/{heading,toc,links,excerpt,readingTime,reference}.ts`；新增 `utils.ts: extractTextFromNode(node)`（从嵌套 children 递归抽纯文本，统一 heading/toc/excerpt/readingTime 四处用） |
| Phase 4 | 自管 Plugin Registry + 内置插件注册器 | `plugins/{types.ts, registry.ts, builtin.ts}`：Map-based 40 行自管 IoC（不依赖 @core/registry）；order 常量 = heading 10 → toc 20 → links 30 → excerpt 40 → readingTime 50 → reference 100 |
| Phase 5 | 双 Renderer 实现（HTML + JSON VNode 描述） | `renderer/htmlRenderer.ts`（v1 策略：委托 marked.parse + marked.use heading() 共享同一份 slugifyHeading 纯函数，保证 HTML id=AST heading.id）；`renderer/vnodeRenderer.ts`（递归 AST→框架无关 JSON VNode shape {type,is,props,children}，可 JSON.stringify 无损传输） |
| Phase 6 | Pipeline 串联 + 公共 API + 应用侧 Vue 适配层 | `pipeline/pipeline.ts`：四格式输入归一化→parse→runPlugins→render→errors 收集；`index.ts` 导出公共 API（createEngine/getEngine/setEngine/parseMarkdown/runRenderPipeline/renderToHTML/renderToVNode/compile/registerPlugin/...）；app/render/{pipeline.ts,register.ts,vueRenderer.js,theme/MarkdownRenderer.vue} 改成薄适配层（调用 engine，而不是自己做解析）；删除 app/render/{parsers,transformers} 下 9 个旧 JS 文件 |
| Phase 7 | Fixtures + 15 单元测试 + 构建+同步验证 | `tests/fixtures/{basic,math,table,code}.md` 4 样例；`tests/parser.test.ts` 7 tests / `tests/pipeline.test.ts` 8 tests（15 全绿）；`npm run build` / `npm run sync` 全绿 |

### 验证四连 ✅（四条全绿 = Engine 独立化成功）
| # | 验证项 | 命令 | 结果 |
|---|--------|------|------|
| 1 | Parser 单测（独立可运行，不依赖 Nuxt） | `npx tsx markdown-engine/tests/parser.test.ts` | ✅ 7/7 PASS：basic/code/table/list 节点正确 + frontmatter 提取剥离 + 空字符串安全 + math 节点注入 |
| 2 | Pipeline 全链路（独立可运行） | `npx tsx markdown-engine/tests/pipeline.test.ts` | ✅ 8/8 PASS：plugin 数 6 + html 非空含 h1 + VNode.type='root' + compile 全字段 + headings[] 填充 + toc[] 条目数正确 + readingTime.minutes 存在 + errors=[] |
| 3 | 类型检查 + 构建（含 Vue 适配层集成） | `npm run build` | ✅ exit 0 · `✨ Build complete!`（修复：vueRenderer.js / MarkdownRenderer.vue 中 `as string` 语法删除，改 `result.rendered \|\| ''`，JS 不允许 TS cast） |
| 4 | 数据链路（引擎不影响 DB 同步） | `npm run sync` | ✅ exit 0 · scanned:8 / upserted:8 / skipped:0 / errors:0 |

### 7 项关键踩坑记录（每一项都让构建/测试炸过一次，详细理由见对应 DESIGN/ADR 章节）
| # | 踩坑点 | 根因 | 解决方案 | 文档锚点 |
|---|--------|------|---------|---------|
| 1 | `@me` 别名路径指向错误根 | 初版 alias `@me → markdown-engine/`（根目录），导致 `import '@me/ast/types'` 解析成 `markdown-engine/ast/types`（不存在），实际文件在 `src/` 下 | nuxt.config.ts + tsconfig.json 全部改为：`@me` → `markdown-engine/src`，同时保留 `@me/*` 双 entry | DESIGN §2.3 + SPEC §4 前置说明 |
| 2 | 公共 API Plugin 类型导出路径错 | index.ts `import type { Plugin } from './plugins/registry'`，但 Plugin interface 实际定义在 `./plugins/types.ts`，registry 只有内部 PluginDefinition | index.ts Plugin 类型改从 `./plugins/types.ts` import；registry 内 `export type PluginDefinition` 仅供内部使用 | SPEC §4.1 导出清单 |
| 3 | JS/Vue 文件出现 TS cast 语法构建失败 | `vueRenderer.js:28` 写 `(result.rendered as string) \|\| ''` / `MarkdownRenderer.vue:61` 同写法；Nitro build 时 JS 不允许 TS8006 | 统一改 `result.rendered \|\| ''`（运行时类型是 string \| nullish，\|\| 天然兜底空串） | Pipeline Phase 6 适配层代码 |
| 4 | marked v18 Renderer API 签名变更旧调用失败 | htmlRenderer.ts 沿用旧 `heading(text, level, raw, slugger)` 四参数签名，marked v18 已改成对象签名 `heading({ tokens, depth, raw })` | htmlRenderer 改为 `marked.use({ renderer: { heading({ tokens, depth }) { ... } } })`；**heading 的 id 统一 import `transformer/heading.ts` 的 `slugifyHeading()` 纯函数**，和 Transformer 侧 id 100% 一致 | ADR 006 + 008 |
| 5 | Heading/TOC 文本提取失败（heading id 全为兜底 h-1/h-2，TOC text 为空） | 用 `(node as any).value \|\| (node as any).content` 找字段，但 heading 的纯文本藏在 `children[0].value` 或嵌套多子节点（带粗体的标题会拆成 text + strong + text 三个孩子） | 新增 `transformer/utils.ts: extractTextFromNode(node)`：value 存在→返回 value；children 存在→递归 map join；否则空串；**heading/toc/excerpt/readingTime 四处全用它** | DESIGN §12 + ADR 007 |
| 6 | Parser frontmatter 测试断言太宽失败 | 初版断言 `!ast.content.includes('---')`，但 basic.md fixture 正文含表格的 `| --- | --- |` GFM 语法，本来就该有 --- 出现 | 断言改为 `!ast.content.trimStart().startsWith('---')`（仅校验「开头的 frontmatter 块是否已剥离」，不校验正文是否完全不出现 ---） | tests/parser.test.ts "extracts frontmatter" case |
| 7 | Pipeline heading plugin 断言 ast.headings 未填充 | 初版 heading transformer 只在每个 heading 节点上挂 id，忘了**并行往 ast.root 上收集 ast.headings: HeadingInfo[]** | heading transformer 开始前 `const ast.root.headings = []`，遍历到 heading 节点时除了 set id 还 push `{ id, text, level }` 进 headings 数组；toc transformer 从这个数组取数据（不再自己扫一遍 children，顺序保证一致） | tests/pipeline.test.ts "heading plugin injects IDs and populates ast.headings" case |

### 架构契约变更（联动顶层 ARCHITECTURE.md）
- `standards/Architecture/ARCHITECTURE.md` Status: Draft → **Partially Implemented**（Content Engine + Markdown Engine V1 已落地，Search/Learning 蓝图）
- §2 总体架构说明新增：Markdown Engine 位于根目录 `markdown-engine/`（**不是 app 内路径**），公共别名 `@me` → `markdown-engine/src`，零 Nuxt/Vue/DB 依赖，可独立发布 npm
- §4 Markdown Engine 小节职责扩展：明确双输出格式 + 6 内置插件顺序常量 + 公共 API 完整列表 + Engine 自管 Registry（不引 @core/registry）+ 禁止直接挂载 Vue 组件引用（必须 JSON VNode 描述）
- §7 技术替换原则示例修正：现在 Parser 实际技术 = **marked.lexer + MDAST convert**（不是 markdown-it）；可选 remark/rehype/micromark，但 AST Schema 必须保持 MDAST 兼容否则 Breaking Change 走 RFC

### 三文档（SPEC / DESIGN / ADR）联动修订一览
| 文档 | 修订内容 | 关键章节 |
|------|---------|---------|
| **SPEC.MD**（实现契约） | Status→Implemented；§4 列全 10+ 公共 API 导出签名；§7 AST 明确根节点 `type:'root'`（不是 document）+ MDAST 对齐清单；§8 明确 HTML string + JSON VNode 双输出 + VNode 精确 shape；§9 列 4 实际 fixtures + 15 tests 清单与执行命令；§12 清理嵌套混乱的 markdown 代码块 | SPEC §4 / §7 / §8 / §9 |
| **DESIGN.MD**（设计理由） | 原 §5-§15 标题全部补齐 `##` 格式（原文档 section 层级混乱，5 到 15 号标题缺 ##，目录无法阅读）；新增 §11 Technology Decisions（4 子项：marked 选型对比 / AST Schema / htmlRenderer v1 委托策略 / VNode 递归）；§12 extractTextFromNode 设计模式说明；§13 自管 Registry vs @core/registry 的依赖倒置论证；§16 落地目录树对照表（设计角色↔实际文件 19 行精准映射）；§17 V1→V2→V3 路线图状态标注 | DESIGN §11 / §12 / §13 / §16 |
| **ADR.md**（关键决策 ADR） | 保留前置 5 条规范要求（反模式清单 + 三文档协作 + 公共 API shape + VNode JSON 要求 + test fixtures 要求）；新增 ADR 001~008（独立根目录 / marked.lexer 选型 / 自管 Registry / 6 插件 order 常量 / VNode JSON 描述格式 / htmlRenderer v1 委托权衡 / extractTextFromNode utility / marked v18 Renderer API 适配），每条含背景、决策、落地、反模式 | ADR §1-§2 ADR 001~008 |

### 回滚保障（最坏 <1min）
本次引擎独立化**完全非破坏性**：
- app/render 下所有功能被 Engine 适配层替代，**公共调用方式（@core/registry getParser('markdown') / getRenderer('vue') / Engine.renderContent）零变动**
- 如果出现渲染问题：回滚一次 commit 即可（所有旧文件的删除 = git revert 可一次性恢复）；新的 `markdown-engine/` 目录不影响任何旧代码路径
- 兼容模式已内置：Vue 适配层 (`app/render/register.ts`) 仍用 `@core/registry` 注册 Parser/Transformer/Renderer（Engine 内部 Registry 和 app 的 Core Registry 互相透明，互不影响）
