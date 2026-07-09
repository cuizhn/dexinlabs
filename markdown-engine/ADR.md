# Markdown Engine — 架构边界规范 + 决策记录 (ADR)

> 版本: 1.0 · 最后更新: 2026-07-09

---

## Part 1 · 引擎边界与演进规范（长期红线，任何决策不得突破）

### 1.1 项目定位

Markdown Engine 是本系统中的**独立基础设施层（Infrastructure Layer）**。

它负责：
* Markdown 文档解析
* AST 构建
* 内容转换
* 插件扩展
* 渲染输出

它**不负责**：
* 课程业务逻辑
* 用户系统
* 数据库查询
* 内容管理
* 页面路由
* Nuxt 生命周期

### 1.2 架构原则（红线，违者 Code Review 直接打回）

Markdown Engine 必须与业务模块**完全解耦**。

**禁止**：
* Markdown Engine 引入 Course Module
* Markdown Engine 引入 Content Engine（允许反向：Content Engine 调 Markdown Engine）
* Markdown Engine 依赖 Nuxt API
* Markdown Engine 依赖 Vue Component
* Markdown Engine 直接访问数据库
* `markdown-engine/src/` 下出现任何 `from 'vue' / 'nuxt' / '@core' / '@data' / '@render' / '@shared' / '@boot' / '@modules' / '#imports'` 的 import

**允许**：
* Content Engine 调用 Markdown Engine
* Course Module 使用 Markdown Engine 输出结果
* Vue Renderer 作为 Markdown Engine 的适配层（放在 `app/render/`，不放在引擎内部）

### 1.3 依赖方向

**正确（单向向下）**：
```
Content Engine  (app/core/engine)
    │
    ↓  通过 @me 别名或 @render/pipeline 适配层调用
Markdown Engine (根目录 markdown-engine/src)
    │
    ↓  引擎内子层单向依赖
Parser → AST → Plugins/Transformers → Renderer
    │
    ↓  通过 @me 公共 API 输出
Vue Adapter Layer (app/render/*)
```

**错误（不允许）**：
```
Markdown Engine → Course Module     ❌ 反向依赖业务
Markdown Engine → Nuxt Pages        ❌ 反向依赖 UI
Markdown Engine → @core/registry    ❌ 引擎自有插件注册表，不共享 IoC
```

### 1.4 目录要求（已完全落地）

引擎位于**项目根 `markdown-engine/`**，与 `app/` 平级（独立于 Nuxt srcDir）。

```
markdown-engine/
├── ADR.md                ← 本文件：规范 + 决策记录
├── DESIGN.MD             ← 设计思想 + 详细决策理由
├── SPEC.MD               ← 实现契约（公共 API + 内部结构 + 测试要求）
├── VERSION.md            ← 版本记录
├── RFC/                  ← 重大变更放 RFC（snapshots 可以放 snapshots/ 下）
├── src/                  ← 引擎源代码（@me 别名 → 这里）
│   ├── index.ts          ← 公共 API 唯一出口
│   ├── ast/types.ts      ← AST + Transformer + Renderer + VNode 全部类型
│   ├── parser/           ← markdown.ts / frontmatter.ts / math.ts
│   ├── transformer/      ← 6 个内置转换器 + utils.ts（纯函数）
│   ├── plugins/          ← types.ts / registry.ts / builtin.ts（引擎自管 IoC）
│   ├── renderer/         ← htmlRenderer.ts / vnodeRenderer.ts
│   └── pipeline/pipeline.ts ← 固定流水线 Parse → Plugins → Render
└── tests/                ← 独立运行（不依赖 Nuxt），用 tsx 直接执行
    ├── fixtures/         ← basic.md / math.md / table.md / code.md
    ├── parser.test.ts    ← 7 tests（2026-07-09 全过）
    └── pipeline.test.ts  ← 8 tests（2026-07-09 全过）
```

### 1.5 公共 API 设计要求（SPEC §4 的细化约束）

外部调用者只能使用 `@me` 或 `markdown-engine/src/index.ts` 导出的符号。**禁止业务代码直接 import parser/transformer 内部函数**。

允许暴露的最小集合：
```ts
createEngine(config?)      → MarkdownEngine 实例
getEngine() / setEngine()  → 单例存取
parseMarkdown(md, opts?)   → Promise<RootAstNode>
runRenderPipeline()        → 全流水线（parse→plugins→render）
renderToHTML() / renderToVNode() → 便捷方法
registerPlugin() / unregisterPlugin() / getPlugins() / clearPlugins()
registerBuiltinPlugins()
```

### 1.6 演进要求

引擎必须支持**长期独立演进**。未来可能替换：markdown parser（marked → micromark）、AST 标准、Renderer 输出格式、Plugin System。

**但不能影响**：Content Engine、Course Module、页面组件。保证：公共 API 签名不破（或走 semver + 旧签名兼容期 14 天）。

### 1.7 实施原则（四优先）

执行者必须**优先保证**：
1. 架构边界正确（不把 Vue/Nuxt/业务依赖引进引擎）
2. 公共 API 稳定（每次改签名先想"能不能只新增、不破旧的"）
3. 可测试（纯函数 + fixtures，测试不依赖 Nuxt）
4. 可扩展（新增能力优先 Plugin 化，不硬改 Parser/Renderer 核心）

**不要**为了快速实现把代码直接写进业务模块。

---

## Part 2 · 实际架构决策记录 (Decision Log)

以下是 ADR0709 Phase 1-7 落地过程中的**关键决策**。记录「为什么这么选」+「替代方案 + 取舍」，避免未来推翻重来时踩同样的坑。

---

### ADR-ME-001（2026-07-09）· 引擎位置：根目录 markdown-engine/（平级 app/）

#### 背景
架构文档（ARCHITECTURE.md / ADR.md Part 1 §1.4）要求 Markdown Engine 是**独立基础设施层**。有三个候选位置：

| 选项 | 优劣 |
|------|------|
| A. `app/markdown-engine/` | 在 Nuxt srcDir 内，auto-import/tsconfig 省心，但和 Vue/Nuxt 混在一起——未来抽 npm 包会很痛。**本质没解耦**，只是换了个子目录 |
| B. `app/render/` 继续存逻辑 | 零搬迁成本，但 6 个 transformer + parser + pipeline 全散在 app/，纯逻辑和 Vue SFC 混放，长期 O(n) 维护成本 |
| C. **根目录 `markdown-engine/`（平级 app/） ✅ 选** | 物理独立，零 Vue/Nuxt 依赖是天然硬约束（需要依赖只能写别名）；未来直接 `mv markdown-engine /path/to/new-repo && npm publish` 就能发包 |

#### 决策：选 C（根目录独立）

**配套动作**：
- nuxt.config.ts 加 `@me: path.resolve(rootDir, 'markdown-engine/src')` 到 alias + vite.resolve.alias 两处
- tsconfig.json 加 `"@me": ["markdown-engine/src"], "@me/*": ["markdown-engine/src/*"]`（双 key：裸 key + wildcard，经典坑）
- `include` 加 `"markdown-engine/**/*.ts"`，让 tsc 类型检查覆盖引擎代码

#### 反例（避免下次再犯）
不要写 `@me → markdown-engine/`（根目录）—— 这样 `@me/ast/types` 会解析成 `markdown-engine/ast/types`，实际文件在 `markdown-engine/src/ast/types`，差一层 src 找不到模块。

---

### ADR-ME-002（2026-07-09）· 真实 Parser 技术选型：marked.lexer() → MDAST AST

#### 背景
旧的 `app/render/parsers/markdown.js` 是 passthrough——把全文塞进一个 `{type:'text', value: content}` 节点，完全没有真实解析。需要替换为**真正把 Markdown 拆成结构化 AST**。

候选方案四选一：

| 方案 | 优点 | 缺点 |
|------|------|------|
| A. **marked v18 `marked.lexer()` ✅ 选** | 已安装 v18，零新依赖；lexer 输出 flat block tokens + 嵌套 inline tokens，转 MDAST 仅需 300 行左右递归转换；gfm/table/code/task-list 内建支持 | marked v18 Renderer API 签名大改（见 ADR-ME-008），踩一次坑 |
| B. remark + remark-parse | 社区最大，插件生态最丰富 | 引入 4+ 新包（unified/remark/remark-parse/remark-gfm…），构建体积 +300KB；学习成本高（Visitor 模式 vs 简单递归） |
| C. markdown-it | 轻量灵活 | 写 parser 需要写自定义 rules，inline tokens 结构没 marked 直观 |
| D. 手写 regex Parser | 0 依赖 | 手写 GFM 表格/嵌套 list/emoji 成本至少 1000 行，bug 率高 |

#### 决策：A（marked.lexer → MDAST）

Token → MDAST 节点映射表（写进 parser/markdown.ts 的 `convertBlockToken/convertInlineToken`）：

| marked token type | MDAST AstNode.type | 额外字段 |
|-------------------|--------------------|---------|
| `heading`         | `'heading'`        | `depth: number`, `children` 递归 inline |
| `paragraph`       | `'paragraph'`      | `children` |
| `code`            | `'code'`           | `lang?: string`, `value: string` |
| `list`            | `'list'`           | `ordered: boolean`, `items → listItem children` |
| `hr`              | `'thematicBreak'`  | 无 |
| `table`           | `'table'`          | `children: [tableRow(header), ...tableRow(data)]` |
| `blockquote`      | `'blockquote'`     | `children` |
| `strong/em/del`   | `'strong'/'emphasis'/'delete'` | `children` |
| `link`            | `'link'`           | `href / title / children` |
| `codespan`        | `'inlineCode'`     | `value: string` |
| `image`           | `'image'`          | `url / alt / title` |

Math 注入：opts.math=true 时，**后处理**（walk AST 文本节点 → split `$..$`/`$$..$$` → `inlineMath`/`math` 节点）。不进 marked lexer 自己的 tokenizer 链，避免 marked 自定义 tokenizer 学习成本。

---

### ADR-ME-003（2026-07-09）· 插件注册表：引擎自管 Map，不共享 @core/registry

#### 背景
app/ 侧已有 `@core/registry` 做 Content Engine 的 IoC。有两个选择：

- A. 复用 `@core/registry`：代码省 30 行，但是 `markdown-engine/src/` 会直接引 `@core/registry` → **直接破 Part 1 §1.2 红线**（引擎依赖 Core）
- B. **引擎自管内部 Registry（Map-based）✅ 选**：插件系统简单（只需 register/runPlugins/getPlugins/clearPlugins 四操作），写 30 行足够

#### 决策：B（引擎自管）

实现位置：`plugins/types.ts + plugins/registry.ts`，`runPlugins` 内部是按 order 升序 for-loop，每个插件 try/catch 单独保护（一个插件失败不影响下一个），失败写 `console.warn`。

App 侧通过 `app/render/register.ts` 里的「薄适配器」把引擎 parser/renderer 再注册进 @core/registry（双向注册：引擎内部 Map + 外部 IoC，互不污染）。

---

### ADR-ME-004（2026-07-09）· 6 个内置插件顺序：Heading(10) → TOC(20) → Links(30) → Excerpt(40) → ReadingTime(50) → Reference(100)

#### 背景
6 个 Transformer 是纯函数，彼此存在**明确依赖链**：
- TOC 必须等 Heading ID 注入完才能收集（否则 toc[i].id 是空的）
- Links/Excerpt/ReadingTime 互相独立，但都在内容结构稳定后跑
- Reference 是引用初始化（不写业务逻辑），放最后作为收尾

#### 决策：按上表 order 注册，从小到大

数字留余量（10/20/30... 之间 10 的间隔），这样未来插插件不用整体改一遍——比如想在 heading 后、TOC 前加「Anchor 链接注入」，order = 15 就行。

常量定义位置：`plugins/builtin.ts` 的 `BUILTIN_PLUGINS` 数组。

---

### ADR-ME-005（2026-07-09）· VNode 输出：框架无关 JSON 描述 `{ type, is, props, children }`

#### 背景
旧 `app/render/renderers/vueRenderer.js` 返回 `{ component: MarkdownRenderer.vue, props: {...} }` ——**直接引用 Vue SFC 组件**，违反 DESIGN.MD §8 的「不直接返回组件实例」红线，也让引擎层概念性依赖 Vue。

#### 决策：输出纯 JSON VNode 描述

精确形状（写死在 ast/types.ts 的 `VNode` interface）：
```ts
interface VNode {
  type: string                  // 语义类型: 'heading' / 'math' / 'paragraph' ...
  is?: string                   // 渲染用 tag 或组件名: 'h2' / 'KatexElement' / 'a' / '#text'
  props?: Record<string, unknown>  // HTML 属性 / 组件 Props
  children?: VNode[] | string   // 子 VNode 数组 或 纯文本（叶子节点）
  [key: string]: unknown        // 向后兼容扩展位
}
```

**典型映射示例**（renderer/vnodeRenderer.ts 里 convertNode switch 实现）：

| AST Node | VNode |
|----------|-------|
| `{type:'heading', depth:2, id:'章节一', children:[{type:'text', value:'章节一'}]}` | `{ type:'heading', is:'h2', props:{ id:'章节一' }, children:[{type:'text', is:'#text', props:{ nodeValue:'章节一' }}] }` |
| `{type:'math', value:'E=mc²', display:true}` | `{ type:'math', is:'KatexElement', props:{ formula:'E=mc²', display:true }}` |
| `{type:'link', href:'https://x.com', children:[...]}` | `{ type:'link', is:'a', props:{ href, target:'_blank', rel:'noopener noreferrer' }, children:[...] }` |

Vue 消费侧：`app/render/components/RenderedNode.vue` 用 `<component :is="node.is" v-bind="node.props">` 递归渲染——引擎完全不知道这层的存在。

---

### ADR-ME-006（2026-07-09）· HTML Renderer v1：委托 `marked.parse(ast.content)`，不自己写 AST→HTML Walker

#### 背景
两条路线：

| 路线 | 优点 | 缺点 |
|------|------|------|
| A. **写完整 AST→HTML Walker（递归遍历每个节点类型输出 HTML）** | 纯引擎输出，不依赖 marked parser 两遍 | 至少 500 行，表格/代码高亮/任务列表/GFM autolink 这些细节非常容易写错；Heading/Strong/Em 嵌套层级、自闭合标签、实体转义全要自己维护 |
| B. **委托 marked.parse（传入 ast.content 原文）✅ 选** | 保证 GFM/table/code/task-list/autolink 等质量 100% 等同于 marked 官方，代码 <60 行 | Heading ID 注入要单独重写 marked Renderer.heading hook；等于"解析两次"（lexer→AST 一遍、parse→HTML 一遍）——但 Markdown 单篇通常 <100KB，两遍解析成本可忽略 |

#### 决策：v1 用 B，预留 walker 接口给 v2 升级

Heading ID 注入方法（见 htmlRenderer.ts）：marked v18 用 `marked.use({ renderer: { heading({ tokens, depth }) {...} } })`，在 heading 钩子内部：
1. `this.parser.parseInline(tokens)` → 得到内联内容的 HTML（含 strong/em/link）
2. 去 HTML tags 得到纯文本
3. `slugifyHeading(plainText)` → 与 heading transformer 用**同一个函数**，保证 HTML 输出的 id 和 AST 节点 id 完全一致（v2 升级 walker 时这个一致性约定也不能破）

**v2 升级条件**：当 marked 被替换（如迁移 micromark/remark 生态）时，顺带写 AST→HTML Walker，v1 兼容期保留。

---

### ADR-ME-007（2026-07-09）· AST 文本提取：新建 `transformer/utils.ts` 的 `extractTextFromNode` 递归工具

#### 背景（Phase 7 踩坑发现）
Heading / TOC 两个 Transformer 一开始写的是：
```ts
String(node.value || node.content || '')   // ❌ 永远是空字符串 + fallback 计数器
```
因为 Parser（parser/markdown.ts:99-104）产生的 heading 节点形状是 `{ type:'heading', depth, children:[...] }`——**没有 value 也没有 content**，文本在 children 里的 text/strong/em/inlineCode 子节点中。

#### 决策：统一 extractTextFromNode 工具
- 位置：`transformer/utils.ts`（transformer 内部共享，不移到 shared/，避免引擎依赖外部）
- 算法：如果 node 有 value 直接返回；否则递归 `children.map(extractTextFromNode).join('')`；都没有返回 ''
- 调用方：heading transformer（slugifyHeading 的参数）+ toc transformer（每条 TocEntry 的 text 字段）+ 未来任何需要纯文本的转换器（excerpt 虽然目前直接用 ast.content，但未来想基于 AST 生成 excerpt 就可以复用）

---

### ADR-ME-008（2026-07-09）· marked v18 Renderer API：`heading({ tokens, depth })` 新签名适配

#### 背景（Phase 7 踩坑）
marked v18 对 Renderer 方法签名做了大改：
- **旧签名（marked ≤12）**：`heading(text: string, level: number, raw: string)`
- **新签名（marked ≥13，v18 当前使用）**：`heading({ tokens, depth }: Tokens.Heading)` —— 接收单个 token 对象，不再传散列参数

htmlRenderer.ts 一开始写成旧签名导致：text 实际是 Heading token 对象（`[object Object]`），level 是 undefined，输出 `<hundefined id=...>[object Object]</hundefined>`——Phase 7 最开始 build 通过了但实际 heading HTML 是错的，测试没覆盖 heading HTML id 所以没发现。

#### 决策：固定使用 v18 新签名 + `marked.use()` 注册

```ts
marked.use({
  renderer: {
    heading(this: any, { tokens, depth }: { tokens: any[]; depth: number }): string {
      const text = this.parser.parseInline(tokens)   // v18 获取内联 HTML 的标准方法
      const id = slugifyHeading(stripHtml(text))
      return `<h${depth} id="${id}">${text}</h${depth}>\n`
    }
  }
})
```

`this: any` 是因为 marked 的类型定义没有显式暴露 `this.parser`。项目 tsconfig 有 `noImplicitAny: false`，所以写法合规，无 TS 告警，运行时 this.parser 正确绑定 parser 实例。

---

### 下次写决策的模板
```
ADR-ME-XXX（YYYY-MM-DD）· 标题
- 背景：为什么要选 + 2-4 个候选方案对比表
- 决策：选哪一个，为什么
- 实现位置 / 配套动作：具体改哪些文件 / 加哪些代码约定
- 反例 / 踩坑预警：避免下次再犯
```
