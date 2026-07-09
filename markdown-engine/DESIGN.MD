# Markdown Engine Design Document

> Version: 1.1
> Status: **Implemented**（2026-07-09 落地；Pipeline + Parser + 6 Plugin + HTML/VNode Renderer + 15 Tests 验证通过）
> Owner: DeXin Labs

---

## 1. Overview

Markdown Engine 是德鑫实验室内容系统的核心渲染基础设施。

它的目标不是简单显示 Markdown 文本，而是建立一个：

- 可扩展
- 可测试
- 可长期演进

的内容处理引擎。

设计目标阶梯：

```
Markdown 原文
    ↓
Structured Content（结构化内容 = MDAST AST）
    ↓
Interactive Learning Content（V1 先提供结构化挂载点，V2/V3 接教育扩展）
```

最终服务于：

- 课程内容
- 学习笔记
- 数学公式
- 代码示例
- 图表
- 互动组件

---

## 2. Design Motivation

### 2.1 为什么不直接使用框架内置 Markdown

早期可以使用：

- Nuxt Content
- markdown-it
- remark

但是长期存在问题：

- 内容结构受框架限制
- 插件扩展受限制
- 无法加入教育领域特性（Concept/Exercise/Reference Node 等自定义语义节点）
- 难以迁移（框架绑定 → 导出到独立项目需要重写）

因此：**Markdown Engine 独立维护**，位于仓库根目录 `markdown-engine/`，不依赖 Nuxt/Vue/DB，未来可独立发 npm 包。

---

## 3. Core Design Principles

### 3.1 Separation of Concerns

系统三层分离，任何功能只属于其中**一个**层，禁止跨层：

| 层 | 负责 | 不负责 |
|----|------|--------|
| **Content**（Data Layer） | 内容在哪里（DB/Filesystem/Git，元数据/权限/业务查询） | 内容长什么样 |
| **Markdown Engine**（本项目） | 内容如何转换（Parse → AST → Transform → Render） | DB 连接 / 路由 / Vue 组件挂载 / 业务判断 |
| **UI**（Vue/Nuxt） | 内容如何展示（`<component :is>` 渲染 VNode、Tailwind prose 样式、交互、响应式） | Markdown 语法解析、AST 节点转换、slug 生成 |

典型调用链（只能**单向向下**，反向 import 打回）：

```
Course Module
    ↓  （查 DB/Filesystem，拿 body + metadata）
Content Engine（app/data/* / services）
    ↓  （调用 @me 公共 API：createEngine / runRenderPipeline / renderToHTML…）
Markdown Engine（markdown-engine/src/*）
    ↓  （产出 HTML string 或 JSON VNode 描述树）
Vue Component（app/render/* 的 adapters + MarkdownRenderer.vue）
```

### 3.2 Pipeline Architecture

采用固定流水线（Pipeline）设计，**严格按顺序执行，不可跳步不可倒序**：

```
Input（4 种格式归一化：string / AST / {body} / {ast}）
    ↓
Parser（parseMarkdown）
    ↓  产出 RootAstNode { type:'root', children, frontmatter, content }
AST（Engine 内部核心协议）
    ↓  runPlugins(sorted by order ASC)
Transformer × N（Heading→TOC→Links→Excerpt→ReadingTime→Reference → 自定义插件）
    ↓  产出 TransformedRootAstNode（增强 headings/toc/excerpt/readingTime… 字段）
Renderer（二选一：htmlRenderer / vnodeRenderer）
    ↓
Output（HTML string / VNode tree）
```

每个阶段职责单一：Parser 不做 TOC、Transformer 不做输出、Renderer 不回头改 AST。

---

## 4. Why AST（为什么中间层必须是 AST，而不是 Markdown→HTML 直通）

直通方案（Markdown → HTML）的问题：HTML 是 **展示层格式**，只携带了「怎么渲染」的信息，不携带「是什么」的语义信息。

教育内容需要语义节点：

- 知识节点（Concept）：`{ type:'concept', name:'一次函数' }`
- 公式节点（Math）：`{ type:'math', value:'x²+y²', display:true }`
- 示例节点（Code/Example）
- 提示节点（Callout/Hint）
- 练习节点（Exercise）：`{ type:'exercise', question:'...' }`

只有 AST 可以同时满足：

1. 一份输入 → 多种输出：同一份 AST 可渲染 HTML（SEO）、VNode（交互）、JSON（搜索索引）、PDF（导出）
2. 语义可扩展：新增自定义节点类型 = 在 `ast/types.ts` 加条目 + 在 Parser/Plugin 里生成它，不需要动 Renderer 以外的老代码
3. Transformer 纯函数增强：TOC/Headings ID/Excerpt/ReadingTime 这些**与渲染无关的结构化增强**，只能在 AST 层做，做在 HTML 层需要解析 HTML DOM（成本高、易错）

---

## 5. AST as Internal Contract（AST 是 Engine 内部协议）

所有能力围绕 AST：

```
Plugin（Math / Code / Exercise / Concept / Reference / ...）
    ↓  在 Parser 阶段产出或在 Transformer 阶段增强
AST Node（统一在 ast/types.ts 定义）
    ↓  被所有下游消费
Transformer（slug/TOC/excerpt/readingTime/…）  +  Renderer（HTML/VNode）
```

**未来新增功能的正确姿势**：**不是修改 Renderer，而是新增 Node 类型 + 可选 Plugin**。例如新增「知识点高亮节点」：

- Step 1：`ast/types.ts` 加 `ConceptNode extends AstNode`
- Step 2：写 Plugin / 扩展 marked tokenizer，解析 `:::concept ... :::` → ConceptNode
- Step 3：htmlRenderer 加 case 输出 `<div class="concept-card">`、vnodeRenderer 加 case 输出 `{type:'concept', is:'ConceptCard', props:{name, description}}`

**单一真源规则**：所有节点类型只能在 `@me/ast/types.ts`（即 `markdown-engine/src/ast/types.ts`）定义；应用层 `app/core/contracts/{Parser,Transformer,Renderer}.ts` 必须**重新导出**同一份类型，禁止复制粘贴。

---

## 6. Plugin Architecture（为什么必须插件化）

引擎 = 稳定内核 + 可插拔能力。

```
Engine Core（不可轻改：Pipeline / AST Schema / Registry Lifecycle）
        +
Plugins（想加新能力就写新 Plugin，不碰 Core）
```

**Core 负责**：
- Pipeline 调度顺序（Parse→Plugins→Render）
- AST 类型契约（ast/types.ts）
- Plugin 生命周期（注册 / 排序 / 执行 / 错误隔离）
- 公共 API 入口（index.ts）

**Plugin 负责**：
- 特殊语法解析扩展（如 `:::concept` custom fence）
- AST 转换/增强（注入 heading id、TOC、excerpt、readingTime、外链重写…）
- 输出扩展（v2：自定义 Renderer hook，不在本次范围）

---

## 7. Plugin Lifecycle（插件生命周期）

Plugin 是一个带 `{name, version, order, transform()}` 的对象，生命周期严格映射到 Pipeline 阶段：

```
Register（plugins/registry.ts: registerPlugin(name, order)，名字唯一，同名覆盖旧的）
    ↓
Parse（Parser 阶段，Parser 是 Engine 核心，Plugin 暂不插手 Parse；v2 可扩展 custom tokenizer）
    ↓
Transform（核心 hook：每个 Plugin 的 transform(ast, ctx) 按 order 升序串执行，原地增强 ast）
    ↓
Render（Renderer 阶段，Plugin 暂不插手，v2 开放）
```

**排序规则（order 常量）**：

| Name | Order | 为什么这个顺序 |
|------|-------|--------------|
| heading | 10 | 必须先给每个 heading 标 id，其他 transformer 才能拿到稳定锚点 |
| toc | 20 | 必须在 heading 之后，否则拿不到正确的 heading.id |
| links | 30 | 早于 excerpt（否则 excerpt 里会残留 `<a href=...>` 原始字符串） |
| excerpt | 40 | 在 links 改写后、readingTime 之前（excerpt 作为输入测算阅读时间） |
| readingTime | 50 | 基于完整 content + excerpt 做字数统计 |
| reference | 100 | 最后收尾，初始化 references 集合（v2 会扫描 AST 产生真实引用） |
| 自定义插件 | 默认 100+ | 在所有内置插件之后跑 |

---

## 8. Renderer Design（为什么要分离 Renderer + 输出 JSON VNode 而不是 Vue 实例）

**原则**：Renderer 与 Parser 分离。一份 AST → 多种输出。

```
AST
    ↓
Renderer Adapter（按 renderTarget 选择）
    ├──→ HTML string（SEO / 邮件 / PDF 导出）
    ├──→ JSON VNode 描述树（Vue 组件化渲染 / React / Svelte / Web Components）
    └──→（v2 计划）JSON 搜索索引
```

**关于 Vue Renderer 输出格式的关键设计决策**：

> **❌ 反模式（已踩坑，绝对不能用）**：Renderer 直接 `import { h, defineComponent } from 'vue'`，产出 Vue VNode 对象 / Vue 组件引用。
>
> 问题：1. Engine 强耦合 Vue → 失去可移植性；2. Nuxt build 时 SSR 路径下组件解析不稳定；3. ARCHITECTURE.md 要求「公共 API 输出为 JSON 而非组件引用」。

> **✅ 正确模式（已落地）**：Renderer 输出**框架无关 JSON VNode 描述**，可 `JSON.stringify()` 无损传输。
>
> 形状：`{ type, is, props, children }`。其中 `is` 是字符串（HTML tag 或组件名，比如 `'KatexElement'`），由 `app/render/` 的 Vue 适配层通过 `<component :is="node.is" v-bind="node.props">` 实际渲染。
>
> 示例：`{ "type": "math", "is": "KatexElement", "props": { "formula": "x^2", "display": false } }`

---

## 9. Education Domain Extension（教育领域扩展路径）

普通 Markdown Engine（marked/markdown-it）目标 = 「把文章显示出来」。本项目目标 = 「解析教育内容的语义结构」。

**V1 已预留扩展点**（ast/types.ts 已定义，Parser v1 暂不识别，由 v2 Plugin 接入）：

| 节点 type | 形状示例 | 教育语义 |
|-----------|---------|---------|
| `'concept'` | `{ type:'concept', name:'一次函数', description?:string, children }` | 一个核心知识点（未来进 Knowledge Graph） |
| `'exercise'` | `{ type:'exercise', question, options?, answer?, children }` | 练习题/测验题（未来挂 Learning Progress） |
| `'reference'` | `{ type:'reference', target:'chapter-1', displayText?, children }` | 内容内部交叉引用（未来生成反向链接图） |

**V2 接入策略**：不修改 Parser 核心 `markdown.ts`，而是 **通过 marked.use 扩展 tokenizer** 识别 `:::concept` / `:::exercise` 自定义 fence，再在 convertBlockToken 增加 case。这样保持 Parser 主干稳定，新语法是可插拔的。

---

## 10. Relationship With Content Engine（与 Content Engine 的单向依赖关系）

两个 Engine 严格分离，依赖方向**只能是 Content → Markdown，反向 import 直接打回 CR**：

```
Content Engine（app/data/* / app/modules/content/* / services/*）
    负责：Database / Filesystem / CMS / Metadata / 权限 / 业务查询
    ↓  （单向调用：await engine.render(chapter.body) 之类）
Markdown Engine（markdown-engine/*）
    负责：Markdown 语法解析 / AST 构建 / Plugin Transform / Rendering
```

**反例（绝对禁止）**：
- `markdown-engine/src/**` 里出现 `import '@/app/data/...'` / `import '#database/schema'`
- `markdown-engine/src/**` 里出现 `useHead()` / `useRoute()` 等 Nuxt auto-import
- `markdown-engine/src/**` 里 `import { ref, computed } from 'vue'`（VNode 描述是纯 JSON，不需要 Vue 响应式）

---

## 11. Technology Decisions（实际选型，SPEC.MD §11 + ADR.md §2/§8 联动）

Engine 内部三个层的技术选型（按 ADR 002/008 记录）：

### 11.1 Parser 技术选型：marked.lexer() + 手动转换为 MDAST 兼容 AST

**候选对比**：

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| **marked.lexer()**（v18+） | ① 项目已安装 marked（无新增依赖）；② API 稳定成熟；③ lexer 产出 tokens 结构扁平易转换；④ gfm 默认支持；⑤ 不引 6~10 个 transitive 依赖 | 需要手动写 tokens → AST converter（≈200 行） | ✅ **选它** |
| remark（unified + remark-parse） | AST 原生就是 MDAST，生态多 | 项目没装；要引 unified/remark-parse/remark-gfm 等至少 6 个依赖；体积 +400KB；MDX 生态复杂度过高 | ❌ v1 不用，v3 可视情况替换（Parser 不是公共接口，可无缝切换） |
| markdown-it | 插件生态好 | AST 非标准（Token 流，不像 MDAST 节点树）；需要自写树转换 | ❌ 不用 |

**落地模式**：`parseMarkdown(raw)` = extractFrontmatter(raw) → `marked.lexer(body, { gfm:true })` → `convertBlockTokens(tokens)`（递归 convertInlineTokens）→ 组装 `RootAstNode {type:'root', children, frontmatter, content}`。详见 [parser/markdown.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/parser/markdown.ts)。

### 11.2 AST Schema：MDAST 子集 + 教育领域扩展

- **MDAST 对齐的标准节点**：heading / paragraph / text / strong / emphasis / delete / link / image / list / listItem / code / inlineCode / blockquote / thematicBreak / html / table / tableRow / tableCell
- **教育扩展节点**：math（`$..$` 行内 / `$$..$$` 块级，display=true）、concept、exercise、reference（v1 只实现 math 识别，其余 v2 接入）
- **根节点类型**：`type:'root'`（MDAST 标准，不是 `document`）

### 11.3 HTML Renderer v1：「委托 marked.parse + slug 算法共享」策略

**为什么不直接写「递归 AST → HTML 字符串」的纯函数实现？**

原因与权衡（ADR.md 006 有完整记录）：

| 策略 | 复杂度 | GFM/Edge Case 完备度 | Heading ID 一致性 | 选？ |
|------|--------|---------------------|-------------------|-----|
| 纯自写递归 AST→HTML | 高（表格/任务列表/删除线/自动链接/嵌套 emphasis 全要处理） | 低（容易漏 edge case） | 容易（自己控制输出） | ❌ v1 不选，v2 可以补一份 |
| **委托 marked.parse(ast.content) + marked.use(Renderer) 注入同一 slug** | **低**（marked 自己搞定所有 GFM 细节） | **高**（marked 十多年生态保证） | **保证**：Renderer 里 heading() 用的 `slugifyHeading()` 和 heading transformer 是**同一份纯函数 import** | ✅ **v1 选它** |

**v2 演进路径**：当我们需要对自定义节点（concept/exercise/…）输出定制 HTML 时，新增一份纯手写 AST→HTML Renderer，通过 `createEngine({htmlRenderer: 'ast-native'})` 切换即可，公共 API 零变动。

### 11.4 VNode Renderer：递归 AST → JSON VNode 描述树

手写递归实现（已在 `renderer/vnodeRenderer.ts` 落地），每个 AstNode.type → 一个 VNode shape 映射，简单可控。关键形状对照见 SPEC.MD §8.3。

---

## 12. 文本提取模式设计：为什么要 extractTextFromNode（而不是 node.value / node.content）

**问题背景（本次重构真实踩坑）**：

最初 heading transformer 用 `const text = (node as any).value || (node as any).content || ''` 取文本 → 产出 `undefined` → slugify 后得到空 → heading id 全部是 `h-1/h-2/h-3` 的兜底值，TOC 锚点全失效。

**根因**：不同节点的文本字段不一致：
- 叶子 text/inlineCode/code/math：有 `value`
- heading/paragraph/blockquote：**没有** value/text，文本藏在 `children[0].value` / 更深层嵌套里
- heading + inline formatting（`## **粗体** 标题`）：文本拆在 children 多个节点里，需要拼接

**设计模式（落地在 transformer/utils.ts：extractTextFromNode）**：

```
extractTextFromNode(node: AstNode): string
    ├── 如果 node.value 存在 → return node.value（叶子）
    ├── 如果 node.children 存在 → return children.map(extractTextFromNode).join('')（递归拼接）
    └── 其他情况 → return ''
```

**应用场景（都用它，不要自己访问 .value/.content）**：
- heading transformer：slug 生成 + HeadingInfo.text
- toc transformer：TOC 条目标题
- excerpt transformer：纯文本摘要
- readingTime transformer：字数统计

---

## 13. 自管 Plugin Registry：为什么不依赖 app/core/registry

**问题（反模式）**：如果 Engine 的 Plugin 系统用 `@core/registry`：
- Engine 必须放在 `app/` 下 → 丧失「独立发 npm 包」的可能性
- 测试时需要连带初始化 @core/registry → 耦合度爆炸，Engine 测试跑不起来

**解决方案（ADR.md 003）**：Engine 自带**极简 Map-based Registry**（≈40 行 TS，位于 `plugins/registry.ts`）：

```ts
const registry = new Map<string, PluginDefinition>()  // name → {plugin, order}
registerPlugin(name, order)  // 存入 Map（同名覆盖）
getPlugins()                 // Object.values(registry).sort((a,b) => a.order-b.order)
runPlugins(ast, ctx)         // getPlugins() 串式 await 执行 transform
clearPlugins()               // 测试后清空
```

**与 @core/registry 的兼容方式**：在 `app/render/register.ts` 用**薄适配层**把 Engine 的 parser/renderer 以兼容格式注册进 `@core/registry`，保持已有业务代码调用方式不变。Engine 本身不知道 @core/registry 存在。

---

## 14. 单例 Engine + createEngine 双模式

**为什么两种创建方式？**

| 模式 | 用法 | 适用场景 |
|------|------|---------|
| `getEngine()` | 延迟单例，首次调用自动 createEngine() | 95% 业务场景：Nuxt 全局只需要一个引擎实例，避免重复初始化插件注册表 |
| `createEngine(config?)` | 每次返回新实例，插件 registry 独立 | 测试 / 自定义引擎（比如「禁用 toc 插件」的特殊场景） / 不同渲染目标用不同配置 |
| `setEngine(e)` | 替换单例（慎用） | Vitest 里 mock Engine / E2E 替换 |

便捷 API（`parseMarkdown / runRenderPipeline / renderToHTML / renderToVNode / registerPlugin / ...`）全部内部走 `getEngine()`，业务代码无需关心实例。

---

## 15. Testing Strategy（引擎测试独立可运行，不依赖 Nuxt/Nitro）

**原则**：测试的不是代码行数，而是**行为契约**。重构时 AST 输出不变 = 成功；改了 = 回归。

**两层测试**：

```
Parser 单元（parser.test.ts）
    输入：fixtures/*.md
    验证：parseMarkdown() 产出的 AST 节点数量/类型/关键字段是否正确（7 tests，全绿）

Pipeline 全链路（pipeline.test.ts）
    输入：string / AST 等四种格式
    验证：plugin list 正确、HTML 输出语义正确、VNode 形状正确、TOC/headings/readingTime 增强字段存在（8 tests，全绿）
```

**Fixtures（已落地 4 个基础样例）**：
- `fixtures/basic.md`：frontmatter + 多级标题 + 粗体斜体 + 有序/无序列表 + 引用 + 外链 + 行内代码
- `fixtures/math.md`：行内公式 `$..$` + 块级公式 `$$..$$`
- `fixtures/table.md`：GFM 表格 + 对齐
- `fixtures/code.md`：多个 fenced code block + 行内代码

**执行命令（无需启动 Nuxt，纯 node + tsx 即可，CI 友好）**：
```bash
npx tsx markdown-engine/tests/parser.test.ts
npx tsx markdown-engine/tests/pipeline.test.ts
```

**v2 增强计划**：新增 `snapshots/*.ast.json`，每次跑 parser 测试把 AST 序列化写入，对比快照 diff 防止 Parser 无意修改。

---

## 16. 落地目录树对照表（设计架构 → 实际文件）

> 本节回答「SPEC.MD 里的设计角色，实际对应哪个 TS 文件？」。新 contributor 读这张表即可上手。

| 设计角色 | 实际文件 | 关键 export / 功能 |
|----------|---------|-------------------|
| **Public API 唯一入口** | [index.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/index.ts) | `createEngine / getEngine / setEngine / parseMarkdown / runRenderPipeline / renderToHTML / renderToVNode / registerPlugin / ...` + 全部类型重导出 |
| **AST 类型单一真源** | [ast/types.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/ast/types.ts) | `AstNode / RootAstNode / TransformedRootAstNode / VNode / AstNodeType / TocEntry / HeadingInfo / ReadingTimeInfo / Plugin` + contracts 四种输入类型 |
| **主 Parser** | [parser/markdown.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/parser/markdown.ts) | `parseMarkdown(raw, opts?)`，核心 marked.lexer → RootAstNode 转换逻辑 |
| Frontmatter 提取 | [parser/frontmatter.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/parser/frontmatter.ts) | `extractFrontmatter(raw)`：剥离 `---` 块，简单 kv 解析（不引 js-yaml） |
| Math 包装解析 | [parser/math.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/parser/math.ts) | `parseMarkdownWithMath(raw, opts?)` = `parseMarkdown(..., {math:true})` + 兼容层 |
| **Heading Transformer** | [transformer/heading.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/transformer/heading.ts) | `slugifyHeading(text)` 纯函数（shared 给 htmlRenderer）；内置 heading 插件 transform：inject id + 产出 ast.headings[] |
| TOC Transformer | [transformer/toc.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/transformer/toc.ts) | toc 插件：从已带 id 的 heading 产出 ast.toc[]（hierarchical） |
| Links Transformer | [transformer/links.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/transformer/links.ts) | 外链加 `target="_blank" rel="noopener noreferrer"` |
| Excerpt Transformer | [transformer/excerpt.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/transformer/excerpt.ts) | ast.excerpt 纯文本摘要（默认 140 字） |
| ReadingTime Transformer | [transformer/readingTime.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/transformer/readingTime.ts) | ast.readingTime + ast.readingTimeMinutes（CJK+EN 双语测算） |
| Reference Transformer | [transformer/reference.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/transformer/reference.ts) | 初始化 ast.references = [] |
| Transformer 共享工具 | [transformer/utils.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/transformer/utils.ts) | `extractTextFromNode(node)`（见 §12） |
| Plugin 接口类型 | [plugins/types.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/plugins/types.ts) | `Plugin / PluginDefinition` 接口 |
| **自管 Registry** | [plugins/registry.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/plugins/registry.ts) | `registerPlugin / unregisterPlugin / getPlugins / runPlugins / clearPlugins`（Map 实现，见 §13） |
| 内置插件注册器 | [plugins/builtin.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/plugins/builtin.ts) | `registerBuiltinPlugins(enabled?)`：6 个内置插件 + order 常量表 |
| **HTML Renderer v1** | [renderer/htmlRenderer.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/renderer/htmlRenderer.ts) | `renderToHTML(ast, opts?)`：委托 marked.parse(ast.content) + marked.use(Renderer) 共享 slugifyHeading（见 §11.3） |
| **VNode Renderer** | [renderer/vnodeRenderer.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/renderer/vnodeRenderer.ts) | `renderToVNode(ast, opts?)`：递归 AST → JSON VNode 描述树（见 §8 / §11.4） |
| **Pipeline 固定顺序调度** | [pipeline/pipeline.ts](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/src/pipeline/pipeline.ts) | `runRenderPipeline()`：四种输入归一化 → parse → runPlugins → renderer → errors 收集；`compile()` = 一次性输出 html+vnode+ast+enhancedAST |

---

## 17. Future Evolution（V1 → V2 → V3 路线图）

| 版本 | 范围 | 状态 | 关键里程碑 |
|------|------|------|-----------|
| **V1（本次）** | 基础 Markdown Rendering Pipeline：完整 parser + 6 内置插件 + HTML/VNode 双输出 + 15 测试 + Vue 适配层 | ✅ **已实现** | 今日落地，build + sync + 15 tests 全绿 |
| **V2** | Educational Markdown 扩展：Concept/Exercise/Reference 语法 Parser 接入 + 自定义 Renderer（HTML/VNode 都要加对应节点 case） + Anchor 链接注入 + 代码高亮插件 + Mermaid Diagram | 🔮 蓝图（需 RFC-001/002） | 新增 2~4 RFC，走 Plugin 扩展，不改 Engine 核心骨架 |
| **V3** | Learning Content Engine：Knowledge Graph 构建 + 推荐信号抽取 + AI Analysis Hooks（expose AST 给 LLM） | 🔮 更远期蓝图 | 建立在 V2 稳定的 Concept/Exercise 节点之上 |

**演进原则**：新增能力 = 新增 Plugin / 新增 RFC，不要轻易动 Pipeline 和 Registry 核心。核心代码的改动必须带来「显著降低未来复杂度」的收益，否则就是反向优化。

---

## 18. Design Constraints（落地时的硬性死约束）

1. **Markdown Engine 独立**：`markdown-engine/src/**` 禁止 import Nuxt/Vue/DB/业务层任何路径。违反直接 CR 打回。
2. **业务代码只能用公共 API**：禁止从 `@me/parser/*` / `@me/transformer/*` 直连内部文件，必须从 `@me`（=index.ts）import。
3. **AST 是核心协议**：公共 API 只要涉及结构（输入/输出），优先传 AST（或返回包含 AST 的对象）。
4. **新增能力优先 Plugin 化**：不要直接改 parser/renderer 核心文件；写新的 transform() 函数注册进 registry。
5. **重大变化必须走 RFC**：修改公共 API 签名 / 修改 AST 根节点 shape / 改默认插件顺序。至少留 14 天双导出兼容期。

---

## 19. Final Statement

Markdown Engine **不是**一个「集成进 Nuxt 的 Markdown 渲染组件」。

它是：**德鑫实验室教育内容平台的基础内容处理引擎**——让内容可以被结构化解析、被语义化理解、被插件化扩展、被多端复用渲染，并最终支持未来的智能学习系统（知识图谱 / 个性化推荐 / AI 辅导）。

---

> 三文档协作关系：
> ```
> ARCHITECTURE.md   (standards/Architecture/)   最高层平台规则（约束 Engine 与其他域的边界）
>         │
>         ▼
> DESIGN.MD        (markdown-engine/) ← 本文件   设计思想 + 选型理由 + 模式说明（"为什么这样设计"）
>         │
>         ▼
> SPEC.MD          (markdown-engine/)            精确实现契约（"必须做到什么，精确形状是什么"）
>         │
>         ▼
> ADR.md           (markdown-engine/)            关键决策的 ADR 记录（决策背景 + 可选方案对比 + 反模式清单）
> ```
