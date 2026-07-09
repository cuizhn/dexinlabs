# Markdown Engine Specification

> Version: 1.0
> Status: **Implemented**（2026-07-09 全量落地，build + 15 tests + sync 全绿）
> Owner: DeXin Labs

---

## 1. Purpose

Markdown Engine 提供统一的、与框架无关的 Markdown 处理 Pipeline。

**Input**：Markdown 字符串 / 预解析 AST 对象 / `{body}` / `{ast}` 四种格式任意输入

**Output**：二选一
1. **HTML string**（SEO/SSR/邮件/导出 PDF 用）
2. **框架无关 JSON VNode 描述树**（Vue/React/Svelte/Web Components 消费）

**Pipeline（严格顺序，不可打乱）**：

```
Markdown 原文
    ↓
Parser (parseMarkdown)
    ↓  marked.lexer → MDAST-compatible RootAstNode
AST (RootAstNode {type:'root', children, frontmatter, content})
    ↓  runPlugins() 按 order 升序（Heading→TOC→Links→Excerpt→ReadingTime→Reference）
Transformer × N (增强数据挂 ast.headings / ast.toc / ast.excerpt / ...)
    ↓  TransformedRootAstNode
Renderer（htmlRenderer / vnodeRenderer）
    ↓
Output (HTML string / VNode tree)
```

---

## 2. Responsibility

Markdown Engine 负责：
- Parsing：将 Markdown 原文转换为 **MDAST 兼容 AST**
- AST：维护统一的节点结构（`ast/types.ts` 单一真源）
- Plugin：提供可扩展的增强点
- Rendering：生成最终输出（HTML string 或 JSON VNode 描述）
- Public API：对外暴露稳定的 `createEngine/getEngine/render/parse/compile/registerPlugin/run`

---

## 3. Non Responsibility

Markdown Engine **不负责**（这些是 Content Engine / Vue 适配层的职责）：

| 领域 | 不负责示例 | 谁负责 |
|------|-----------|--------|
| 数据 | 数据库查询、课程/章节 CRUD、Neon 连接 | `app/data/*` + Drizzle |
| 业务 | 课程可见性判断、学习进度、权限 | CourseService / ChapterService 等 |
| 用户 | 用户系统、登录、鉴权、用户数据 | Nuxt Auth（未来实现） |
| 路由 | 页面路由、API 路由、SSR context | Nuxt Pages / Nitro server/api |
| UI | 组件挂载、样式、交互、`<component :is>` 渲染 | `app/render/*` Vue 适配层 |
| 搜索 | 全文搜索、索引构建 | Search Engine（未来蓝图） |
| 内容管理 | CMS、内容版本、Git 同步 | Content Sync Script + Git |

---

## 4. Public API

> 业务代码**只能使用下列符号**（禁止直接 `import from '@me/parser/*' / '@me/transformer/*'` 等内部路径）。
>
> 所有 API 统一从 `@me`（= `markdown-engine/src/index.ts`）或 `markdown-engine/src/index.ts` 导出。

### 4.1 完整导出列表

```ts
// ============ Engine 实例 ============
export interface EngineConfig {
  plugins?: string[]                    // 启用哪些内置插件（按 name filter）；undefined = 全部
  customPlugins?: Plugin[]              // 额外自定义插件
  parserOptions?: Record<string, unknown>
}

export interface MarkdownEngine {
  parse(md: string, opts?): Promise<RootAstNode>
  render(content, opts?: { target?: 'html' | 'vnode' }): Promise<string | VNode | null>
  compile(md: string, opts?): Promise<{ ast, enhancedAST, html, vnode, errors }>
  registerPlugin(plugin: Plugin, order?: number): void
  unregisterPlugin(name: string): void
  listPlugins(): string[]
  run(content, opts?: RenderPipelineOptions): Promise<RenderPipelineResult>
}

export function createEngine(config?: EngineConfig): MarkdownEngine
export function getEngine(): MarkdownEngine         // 单例，不存在则自动 create
export function setEngine(engine: MarkdownEngine): void  // 测试替换 / 自定义 engine 用

// ============ 便捷函数（无需创建实例，内部用 getEngine()） ============
export function parseMarkdown(raw: string, opts?: ParserOptions): Promise<RootAstNode>
export function runRenderPipeline<TRendered>(input, opts?): Promise<RenderPipelineResult<TRendered>>
export function renderToHTML(content, opts?): Promise<string>
export function renderToVNode(content, opts?): Promise<VNode | null>

// ============ Plugin 管理（低阶 API，不建议业务代码直接用） ============
export function registerPlugin(plugin: Plugin, order?: number): void
export function unregisterPlugin(name: string): void
export function getPlugins(): PluginDefinition[]
export function clearPlugins(): void
export function registerBuiltinPlugins(enabled?: string[]): string[]

// ============ 类型（业务代码可自由引用） ============
export type { Plugin }
export type {
  AstNode, RootAstNode, TransformedAstNode, TransformedRootAstNode,
  VNode, ParserOptions, TransformerContext, RendererContext,
  TocEntry, HeadingInfo, ReadingTimeInfo
}
export type {
  RenderPipelineInput, RenderPipelineOptions,
  RenderPipelineResult, RenderTarget
}
```

### 4.2 典型使用示例

```ts
// === 最简用法：HTML 输出 ===
import { renderToHTML } from '@me'
const html = await renderToHTML('# Hello **Markdown**')
// → '<h1 id="hello-markdown">Hello <strong>Markdown</strong></h1>\n'

// === 引擎实例 + 完整 pipeline + VNode 输出 ===
import { createEngine } from '@me'
const engine = createEngine()
const result = await engine.run('# H1\n## H2', { renderTarget: 'vnode' })
// result = { raw, ast, enhancedAST(含 toc/headings), rendered: VNode, errors:[] }

// === 编译（一次性拿 html+vnode+enhancedAST） ===
const r = await engine.compile('## Subheading\n\nContent')
// r.html / r.vnode / r.ast / r.enhancedAST / r.errors 全有
```

---

## 5. Internal Architecture（固定目录，不得随意增删顶层子目录）

```
markdown-engine/src/
├── index.ts              ← Public API 唯一出口（不得在 src/ 其他文件对外 export 给业务）
├── ast/types.ts          ← AST + Transformer + Renderer + VNode 全部类型（单一真源）
├── parser/               ← 输入解析
│   ├── markdown.ts       ← 主解析器：marked.lexer() → MDAST
│   ├── frontmatter.ts    ← YAML frontmatter 提取（简单 kv，不引 js-yaml 依赖）
│   └── math.ts           ← 包裹 parseMarkdown({math:true})
├── transformer/          ← 6 个内置转换器（纯函数，不产生副作用）
│   ├── heading.ts        ← 注入 heading id + 生成 ast.headings[]
│   ├── toc.ts            ← 生成 ast.toc[]（依赖 heading 先执行）
│   ├── links.ts          ← 外站链接 target/rel 改写
│   ├── excerpt.ts        ← 生成 ast.excerpt 纯文本摘要
│   ├── readingTime.ts    ← ast.readingTime（CJK+EN 双语测算）
│   ├── reference.ts      ← 初始化 ast.references[]
│   └── utils.ts          ← 转换器共享工具（目前仅 extractTextFromNode）
├── plugins/              ← 引擎自管 IoC（Map-based，不引 @core/registry）
│   ├── types.ts          ← Plugin / PluginDefinition 接口
│   ├── registry.ts       ← register / unregister / getPlugins(sorted) / runPlugins / clearPlugins
│   └── builtin.ts        ← 6 个内置插件 + order 常量表
├── renderer/             ← 输出层（可多个）
│   ├── htmlRenderer.ts   ← AST → HTML string（v1 策略委托 marked.parse，heading id 注入同 slugifyHeading）
│   └── vnodeRenderer.ts  ← AST → JSON VNode 描述（框架无关）
└── pipeline/pipeline.ts  ← Parse → Plugins → Render 固定流水线（输入四种格式归一化）
```

**顶层子目录约束**：
- `ast/` 只能放类型文件（`.ts`，不含运行时代码）
- `parser/` 只做「原文 → AST」，**严禁**在 parser 里直接写 TOC / Heading ID（那是 transformer 的事）
- `transformer/` 纯函数（输入 ast + ctx，返回「同一 ast 对象增强后」）
- `plugins/` 只做注册调度，不含任何业务转换逻辑
- `renderer/` 只做「增强后 AST → Output」，**严禁**回头改 ast

---

## 6. Plugin System

### 6.1 Plugin 接口形状

```ts
export interface Plugin {
  name: string                              // 唯一 key（重复 = 覆盖旧的）
  version: string                           // semver，用于调试/兼容判断
  order?: number                            // 小先执行；不传 = registerPlugin 第二参数 default 100
  transform(
    ast: TransformedRootAstNode,            // 可原地修改 ast（非 immutable，省一次深拷贝）
    context?: TransformerContext            // 调用方传入的业务上下文（slug/type/excerptLimit/basePath…）
  ): TransformedRootAstNode | Promise<TransformedRootAstNode>
}
```

### 6.2 Plugin 规则

**Plugin 必须**：
1. 独立：不得 require/import `@core / @data / @render / vue / nuxt / #imports`
2. 不修改核心代码（新能力写新 Plugin，不改 parser/renderer）
3. 不依赖业务模块（如果需要业务信息，通过 `TransformerContext` 传入，不直接 import）

### 6.3 内置插件（不可删除，但可通过 `plugins` 参数过滤禁用）

| Name | Order | 功能 | 产出字段 |
|------|-------|------|---------|
| heading | 10 | slugify 注入每个 heading 的 id，汇总 headings 数组 | `ast.children[*].id` + `ast.headings: HeadingInfo[]` |
| toc | 20 | 从 heading 节点构建目录 | `ast.toc: TocEntry[]` |
| links | 30 | 外站链接加 target="_blank" rel="noopener noreferrer" | `ast.children[*]...link.{target, rel, __rewrite}` |
| excerpt | 40 | 纯文本摘要（默认 140 字） | `ast.excerpt: string` |
| readingTime | 50 | CJK+EN 双语测算阅读时间 | `ast.readingTime: ReadingTimeInfo` + `ast.readingTimeMinutes: number` |
| reference | 100 | 初始化引用集合空数组 | `ast.references: ReferenceInfo[]` |

---

## 7. AST Specification

### 7.1 根节点类型 = `root`（MDAST 对齐，**不是 `document`**，该别名已废弃）

```ts
interface RootAstNode {
  type: 'root'
  children: AstNode[]            // block-level children
  frontmatter: Record<string, unknown>  // frontmatter（无则空对象 {}）
  content: string                // 原文（frontmatter 已剥离），供 excerpt/htmlRenderer v1 复用
  [key: string]: unknown         // transformer 可以挂 extra data
}
```

### 7.2 常见节点类型（完整清单见 `ast/types.ts` 的 `AstNodeType`）

| type | shape（非 children 字段） | MDAST 对齐 |
|------|--------------------------|-----------|
| `'heading'` | `{ depth: 1..6, id?: string, children }` | ✅ |
| `'paragraph'` | `{ children }` | ✅ |
| `'text'` | `{ value: string, children? }`（含嵌套 inline 时 children 存在） | ✅ |
| `'strong'` / `'emphasis'` / `'delete'` | `{ children }` | ✅（delete = strikethrough） |
| `'link'` | `{ href, title?, target?, rel?, children }` | ✅ |
| `'image'` | `{ url, alt, title? }` | ✅ |
| `'list'` | `{ ordered: boolean, children: listItem[] }` | ✅ |
| `'listItem'` | `{ checked?: boolean, children }` | ✅（GFM task list） |
| `'code'` | `{ lang?: string, value: string }` | ✅ |
| `'inlineCode'` | `{ value: string }` | ✅ |
| `'blockquote'` | `{ children }` | ✅ |
| `'thematicBreak'` | 无字段 | ✅（= hr） |
| `'html'` | `{ value: string }`（原 HTML 原文） | ✅ |
| `'table'` / `'tableRow'` / `'tableCell'` | tableCell 额外 `align?: 'left'\|'center'\|'right'\|null` | ✅（GFM） |
| `'math'` / `'inlineMath'` | `{ value: string, display: boolean }`（display = true 为块级 `$$...$$`） | ⚠️ 教育领域扩展（MDAST math 兼容） |
| `'concept'` / `'exercise'` / `'reference'` | 自定义字段 | ⚠️ 教育领域扩展（v1 未实现 Parser，v2 接入） |

### 7.3 Transformer 挂载的额外字段（不在 AstNodeType，写在根或节点上）

```ts
interface TransformedRootAstNode extends RootAstNode {
  headings?: HeadingInfo[]      // [{ id, text, level }]
  toc?: TocEntry[]              // [{ id, text, level, children? }]
  excerpt?: string              // 纯文本摘要
  readingTime?: ReadingTimeInfo // { minutes, seconds, words, cjkChars, enWords, cjkRate }
  readingTimeMinutes?: number   // readingTime.minutes 便捷字段
  links?: LinkInfo[]            // （v2 计划：links transformer 汇总结果）
  references?: ReferenceInfo[]  // 引用集合
}
```

---

## 8. Renderer

### 8.1 支持的两种 RenderTarget

| RenderTarget | 返回类型 | 适用场景 |
|--------------|---------|---------|
| `'html'` | `string`（HTML 片段，不含 `<html><body>` 包裹） | SSR/SEO、邮件、导出 PDF、Markdown 预览 |
| `'vnode'` | `VNode \| null`（框架无关 JSON 描述树） | Vue/React/Svelte 组件化渲染、交互增强 |

### 8.2 HTML 输出约定（htmlRenderer.ts 必须遵循）

1. **GFM 全支持**：表格/任务列表/删除线/autolink 必须有效（委托 marked.parse 保证）
2. **Heading ID 注入**：每个 `<h1>`~`<h6>` 必须带 `id="..."`，slug 算法 = `transformer/heading.ts` 导出的 `slugifyHeading(text)` 纯函数，**保证 HTML 的 id 与 AST heading.id 一一对应**（大小写、连字符、CJK 字符保留策略完全相同）
3. **不内联 CSS**：引擎只输出语义化 HTML，样式由业务层（比如 prose.css / KaTeX CSS）负责
4. **数学公式不渲染**：HTML 输出中 `$$...$$` 保持原文或产生 `<pre class="math">`（TODO：v2 可选集成 KaTeX HTML 模式）

### 8.3 VNode 输出约定（vnodeRenderer.ts 必须遵循）

**精确形状**（框架无关 JSON，可 `JSON.parse(JSON.stringify(vnode))` 无损往返）：
```ts
interface VNode {
  type: string                  // 语义类型 = 对应 AST AstNode.type（业务侧可路由样式）
  is?: string                   // 渲染指令：HTML tag / 组件名 / '#text'（纯文本节点）
  props?: Record<string, unknown>  // HTML 属性或组件 Props（可直接 v-bind={props} / {...props}）
  children?: VNode[] | string   // 子节点数组 或 叶子纯文本
  [key: string]: unknown        // 未来扩展位（保证 JSON-safe）
}
```

**典型节点对照**：
```
AST heading (depth=2, id="hello", text="Hello World")
  → VNode: { type:'heading', is:'h2', props:{ id:'hello' },
             children:[{ type:'text', is:'#text', props:{ nodeValue:'Hello World' } }] }

AST math (value="x^2+y^2", display=true)
  → VNode: { type:'math', is:'KatexElement', props:{ formula:'x^2+y^2', display:true } }

AST link (href="https://x.com", external)
  → VNode: { type:'link', is:'a', props:{ href:'https://x.com', target:'_blank', rel:'noopener noreferrer' },
             children:[...] }
```

---

## 9. Testing（引擎测试 *必须* 独立可运行，不依赖 Nuxt / Nitro）

### 9.1 目录
```
markdown-engine/tests/
├── fixtures/                  ← 固定 Markdown 样例（每个样例一个文件）
│   ├── basic.md               ← 标题/段落/粗体/列表/引用/链接/行内代码 + frontmatter
│   ├── math.md                ← 行内 $..$ + 块级 $$..$$
│   ├── table.md               ← GFM 表格 + frontmatter
│   └── code.md                ← 行内代码 + 两个 fenced code block（js + python）
├── parser.test.ts             ← Parser 单元（用 tsx 直接 node 跑）
└── pipeline.test.ts           ← Pipeline 全链路（parse→plugins→render）
```

### 9.2 当前已落地测试（2026-07-09 全绿）

| 文件 | 测试数 | 覆盖内容 |
|------|--------|---------|
| `parser.test.ts` | 7 | heading/code/table/list 节点存在、frontmatter 正确提取且剥离、空字符串安全、`opts.math` 注入 math/inlineMath 节点 |
| `pipeline.test.ts` | 8 | 内置插件数量=6 + has heading/toc、HTML 输出非空 + 含 h1、VNode 输出有 root type、compile 返回 html+vnode+ast+enhancedAST、heading plugin 产出 ast.headings[]、toc plugin 产出正确条目数、readingTime 产出 minutes 字段、合法输入 errors 数组为空 |

### 9.3 执行命令（不依赖 Nuxt，任意环境有 node + tsx 就能跑）

```bash
npx tsx markdown-engine/tests/parser.test.ts     # 独立跑 parser 单测
npx tsx markdown-engine/tests/pipeline.test.ts   # 独立跑 pipeline 全链路
```

### 9.4 未来测试扩展（非本次强制）
- snapshots/ 下 AST 快照（`basic.ast.json` 等）用于 parser 回归
- math code block 带 lang 的高亮测试（v2）
- 自定义插件优先级排序测试

---

## 10. Versioning & RFC

**版本管理**：遵循 SemVer。重大变更（公共 API 签名改、AST 根节点 shape 改、默认 Plugin 顺序变）必须：
1. 创建 RFC 文档放 `markdown-engine/RFC/RFC-XXX-<slug>.md`
2. RFC 模板：
   - **Problem**：为什么要改
   - **Proposal**：改成什么（精确 shape / 签名 / 示例）
   - **Migration**：兼容期多少天、旧 API 何时删除、业务代码如何改
3. 决策通过后先**加兼容期双导出**（至少 14 天），等所有调用方迁移完再删旧 API

---

## 11. Evolution（V1 → V2 → V3 路线图）

| 版本 | 范围 | 状态 |
|------|------|------|
| V1（本次） | 基础 Markdown Rendering：标题/段落/列表/代码块/表格/引用/数学公式（Parser 已识别 + VNode 产出 KatexElement 交由 Vue 渲染） | ✅ Implemented |
| V2 | Educational Markdown 扩展：Concept Node / Exercise Node / Knowledge Link / Anchor 链接注入 / 代码高亮 / Mermaid 图、Diagram | 🔮 蓝图 |
| V3 | Learning Content Engine：Knowledge Graph / Recommendation Signals / AI Analysis Hooks | 🔮 蓝图 |

**新增能力优先 Plugin 化**：V2 的概念节点/练习节点不要改 parser 核心——应写**自定义 Plugin**，在 transformer 阶段插入，或通过扩展 marked.use tokenizer 增加新 token 类型再由 convertBlockToken 识别。

---

## 12. Implementer Rules（执行者死规则）

1. **写代码前先读**：本 SPEC.MD + DESIGN.MD + ADR.md
2. **禁止**：
   - 直接在 `app/pages/**` / `app/components/**` 里写 Parser/Transformer/Renderer 逻辑（属于引擎，写对位置或写 Plugin）
   - 直接绑定 Nuxt/Vue/DB 依赖到 `markdown-engine/src/**`（Code Review 直接打回）
   - 新增顶层目录不经 RFC（比如想加 `markdown-engine/src/compiler/` 必须走 RFC-XXX）
3. **目标**：构建一个独立、可测、可长期演进的 Markdown Engine Library — 不是一个「集成进 Nuxt 的渲染组件」。

---

> 三文档协作关系：
> ```
> ARCHITECTURE.md   (standards/Architecture/)   最高层平台规则（约束 Engine 与其他域的边界）
>         │
>         ▼
> DESIGN.MD        (markdown-engine/)           设计思想 + 决策理由（"为什么这样"）
>         │
>         ▼
> SPEC.MD          (markdown-engine/) ← 本文件  精确实现契约（"必须做到什么，形状是什么"）
> ```
