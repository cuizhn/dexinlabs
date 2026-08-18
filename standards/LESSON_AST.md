# Lesson AST 设计规范

> Version: 1.2
> Status: Active
> Date: 2026-08-18
> 对齐说明：本规范已于 2026-08-18 与代码实现对齐。所有类型以 `shared/lessonAST.ts` 为**唯一事实来源（single source of truth）**，本文档仅作说明，不得与代码冲突。
>
> **架构更新 (2026-08-18)**：Content Compiler 已从 `tools/content-compiler/` 迁移至独立仓库 `dexinlabs-content/compiler/`。主仓不再包含 Compiler 代码，改为通过 `POST /api/content-package` 接收编译后的 Content Package。本文档中 `tools/content-compiler/` 的引用仅反映历史状态，实际位置为 `dexinlabs-content/compiler/`。

---

## 1. 核心原则

**数据库保存的是课程结构（Lesson AST），而不是编辑格式。**

编辑格式（Markdown、富文本、AI 输出等）属于输入层。Content Compiler 是唯一允许将编辑内容转换为 Lesson AST 的模块。所有后续模块（Repository、Service、API、Renderer）均以 Lesson AST 为唯一数据来源，不直接依赖 Markdown。

> 文本块采用**语义化行内节点（`Inline[]`）**，而非行内 HTML 字符串。这是 ADR-0013 §7 所要求的“单一契约”方向：结构化语义由 AST 表达，渲染由 Renderer 的 Vue 组件完成，主项目不存储、不拼接原始 HTML。

---

## 2. 内容流水线

```
作者 / Markdown / 可视化编辑器 / AI / Word / PDF
    │
    ▼
Content Compiler（唯一入口，tools/content-compiler/）
    │
    ▼
Lesson JSON（AST，Inline[] 语义）
    │
    ▼
PostgreSQL（JSONB）
    │
    ▼
Repository（查询 / 保存 / 更新）
    │
    ▼
Content Service（课程组装 / 业务逻辑）
    │
    ▼
API（返回 Lesson AST）
    │
    ▼
Renderer（Block → Vue Component，Inline[] → InlineRenderer）
```

---

## 3. AST 结构定义

> 以下类型与 `shared/lessonAST.ts` 保持一致。如本文档与代码不一致，**以 `shared/lessonAST.ts` 为准**。

### 3.1 顶层结构

```typescript
interface LessonContent {
  /** AST 版本号，用于未来数据迁移 */
  version: 1
  /** 有序的 Block 列表 */
  blocks: Block[]
}
```

### 3.2 Block 联合类型

```typescript
type Block =
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | ListBlock
  | TableBlock
  | FormulaBlock
  | CodeBlock
  | QuoteBlock
  | HintBlock
  | DefinitionBlock
  | ExampleBlock
  | QuestionBlock
  | SectionBlock
  | DividerBlock
```

### 3.3 行内节点（Inline）

文本类 Block 的内容（段落、标题、引用、提示、定义、示例、题目等）统一用**行内节点数组 `Inline[]`** 表达，而不是 HTML 字符串。

```typescript
type Inline =
  | TextInline      // { type: 'text', value: string }
  | BoldInline      // { type: 'bold', children: Inline[] }
  | ItalicInline    // { type: 'italic', children: Inline[] }
  | CodeInline      // { type: 'code', value: string }
  | LinkInline      // { type: 'link', url: string, children: Inline[] }
  | MathInline      // { type: 'math', value: string, display?: boolean }
```

渲染职责：`InlineRenderer` 组件按 `type` 分发到对应节点组件，**不使用 `v-html`**（除 FormulaBlock 的 KaTeX 输出，见 §6.5）。

### 3.4 各 Block 详细定义

#### 基础接口

```typescript
interface BaseBlock {
  /** Block 唯一标识（可选，用于编辑器和锚点） */
  id?: string
  /** Block 类型标识 */
  type: string
}
```

#### 文本类 Block（children: Inline[]）

```typescript
interface ParagraphBlock extends BaseBlock {
  type: 'paragraph'
  children: Inline[]
}

interface HeadingBlock extends BaseBlock {
  type: 'heading'
  level: 1 | 2 | 3 | 4
  children: Inline[]
}

interface QuoteBlock extends BaseBlock {
  type: 'quote'
  children: Inline[]
}

interface HintBlock extends BaseBlock {
  type: 'hint'
  level: 'info' | 'tip' | 'warning' | 'danger'
  children: Inline[]
}
```

#### 媒体类 Block

```typescript
interface ImageBlock extends BaseBlock {
  type: 'image'
  src: string
  alt: string
  caption?: string
}

interface CodeBlock extends BaseBlock {
  type: 'code'
  language: string
  code: string
}
```

#### 数学类 Block

```typescript
interface FormulaBlock extends BaseBlock {
  type: 'formula'
  latex: string
  display: boolean
}
```

#### 结构化 Block

```typescript
interface ListBlock extends BaseBlock {
  type: 'list'
  ordered: boolean
  /** 每个列表项是一个 Inline[] 行内节点数组 */
  items: Inline[][]
}

interface TableBlock extends BaseBlock {
  type: 'table'
  /** 表头单元格（Inline[]） */
  headers: Inline[][]
  /** 表格数据行，每行为单元格数组（Inline[]） */
  rows: Inline[][][]
}
```

#### 教学类 Block

```typescript
interface DefinitionBlock extends BaseBlock {
  type: 'definition'
  term: string
  children: Inline[]
}

interface ExampleBlock extends BaseBlock {
  type: 'example'
  title?: string
  children: Inline[]
}

interface QuestionBlock extends BaseBlock {
  type: 'question'
  prompt: Inline[]
  hint?: Inline[]
  answer?: Inline[]
  analysis?: Inline[]
}
```

#### 组织类 Block

```typescript
interface SectionBlock extends BaseBlock {
  type: 'section'
  title: Inline[]
  blocks: Block[]   // 可递归嵌套
}

interface DividerBlock extends BaseBlock {
  type: 'divider'
}
```

---

## 4. 设计决策

### 4.1 文本 Block 为什么用 `children: Inline[]` 而不是 `content: string`（行内 HTML）？

- **类型安全**：`Inline[]` 是受约束的语义节点，编译器产出的内容与 Renderer 消费的内容完全同构；`string`（HTML）无法在编译期保证结构正确。
- **无原始 HTML 注入**：主项目不存储、不拼接 HTML 字符串，避免 XSS 与“按文档生成 v-html”的误导。
- **渲染由组件负责**：`InlineRenderer` 按 `type` 分发（`bold` → `<strong>`、`link` → `<a>`、`math` → KaTeX …），结构化与样式完全由 Vue 组件表达。
- **跨端一致**：AST 语义固定，Web / PDF / 移动端 Renderer 各自消费同一份 `Inline[]`，不依赖 HTML 字符串。

**关键约束**：文本语义只由 `Inline[]` 表达（text / bold / italic / code / link / math）。块级结构由 Block 类型系统表达（段落、标题、列表、表格等）。Renderer 不做任何 Markdown / HTML 解析。

### 4.2 为什么只有 Section 可以嵌套？

- 简化 AST 结构，避免任意嵌套带来的复杂度。
- Section 是唯一的“分组”语义，其他 Block 都是叶子节点。
- Renderer 只需处理一层遍历 + Section 递归。

### 4.3 为什么块级结构用 AST 而非整篇 HTML？

- 纯 HTML 丢失语义信息（无法区分“定义”和“示例”）。
- 纯 HTML 不利于编辑、搜索、分析。
- 纯 HTML 不利于多端输出（Web / PDF / 移动端）。
- AST 保留结构语义，文本字段使用语义化的 `Inline[]` 节点。

### 4.4 版本号的作用

`version: 1` 为未来 AST 结构变更提供迁移依据。当 Block 结构需要调整时：

1. 递增 version 号；
2. 编写迁移函数（v1 → v2）；
3. Content Compiler 输出最新版本；
4. Repository 读取时根据 version 选择是否迁移。

---

## 5. Content Compiler

### 5.1 职责

Content Compiler（`dexinlabs-content/compiler/`）是**唯一**允许将外部内容转换为 Lesson AST 的模块：

- Markdown → Lesson AST
- 可视化编辑器 → Lesson AST（未来）
- AI 输出 → Lesson AST（未来）
- Word / PDF 导入 → Lesson AST（未来）

> 模块结构：`dexinlabs-content/compiler/index.ts`（scanner + compiler），核心入口扫描 `lessons/` 目录并将 Markdown 编译为 `LessonContent` AST，输出 `output/content-package.json`。Markdown 必须使用 remark + unified 生态（remark-parse / remark-gfm / remark-math / remark-directive），不重新实现 Parser / Lexer。

### 5.2 不得负责

- HTML 渲染
- Vue 组件
- 页面展示
- 数据库操作

---

## 6. 各层职责变更

### 6.1 Markdown Engine（已移除）

主项目（dexinlabs）已完全移除 Markdown Engine（旧的 `app/markdown` remark/rehype/unified 管线）。

Markdown → Lesson AST 的编译职责由 **`dexinlabs-content/compiler/`** 承担（独立内容仓库中的开发/构建工具）。主项目只消费 AST（通过 Publish API 写入 DB 后读取），按 Block 类型渲染。

### 6.2 Repository（简化）

**变更后**：读取单个 JSONB 字段（`content`，即 Lesson AST）+ `astVersion`。

```typescript
// lessons 表
{
  id: number
  slug: string
  title: string
  content: LessonContent   // JSONB，Lesson AST
  astVersion: number
  topic: string
  topicId: number
  order: number
  createdAt: Date
  updatedAt: Date
}
```

Repository 只负责查询 / 保存 / 更新，不做任何解析。

### 6.3 Service（简化）

**变更后**：接收 Lesson AST，组装课程数据，不做 Markdown 编译。

Service 负责：课程组装（关联 Topic、Chapter、导航）、学习状态、权限、业务数据组合。

### 6.4 API（变更）

API 返回 Lesson AST（`content` 字段），不再返回 `bodyHtml` / `introHtml` 等预渲染 HTML 字段。

### 6.5 Renderer（重构）

**变更后**：接收 `blocks: Block[]`，按 Block 类型分发到 Vue 组件（`app/components/content/blocks/*`）。

```
Renderer
  ├─ ParagraphBlock → ParagraphBlock.vue   (children → InlineRenderer)
  ├─ HeadingBlock   → HeadingBlock.vue     (children → InlineRenderer)
  ├─ ImageBlock     → ImageBlock.vue
  ├─ ListBlock      → ListBlock.vue        (items: Inline[][])
  ├─ TableBlock     → TableBlock.vue
  ├─ FormulaBlock   → FormulaBlock.vue     (KaTeX 渲染 latex)
  ├─ CodeBlock      → CodeBlock.vue
  ├─ QuoteBlock     → QuoteBlock.vue        (children → InlineRenderer)
  ├─ HintBlock      → HintBlock.vue         (children → InlineRenderer)
  ├─ DefinitionBlock→ DefinitionBlock.vue   (term + children)
  ├─ ExampleBlock   → ExampleBlock.vue      (children → InlineRenderer)
  ├─ QuestionBlock  → QuestionBlock.vue     (prompt/hint/answer → InlineRenderer)
  ├─ SectionBlock   → SectionBlock.vue      (递归渲染子 blocks)
  └─ DividerBlock   → DividerBlock.vue
```

每个 Block 组件：
- 文本类 Block 的 `children: Inline[]` 交给 `InlineRenderer` 组件渲染（按 `type` 分发，不使用 `v-html`）；
- `FormulaBlock` 调用 KaTeX API 渲染 LaTeX（其输出的 HTML **是** `v-html` 的合法例外，因为内容来自受信任的 KaTeX 渲染结果，非用户输入）；
- 纯结构化 Block（Image、Divider）直接渲染。

---

## 7. 数据库迁移策略

### 7.1 过渡期

在迁移完成前，lessons 表同时保留旧字段和新字段：

```sql
ALTER TABLE lessons ADD COLUMN content JSONB;
ALTER TABLE lessons ADD COLUMN ast_version INTEGER DEFAULT 0;
```

- `ast_version = 0`：旧格式（Markdown 字段）
- `ast_version = 1`：新格式（Lesson AST）

### 7.2 迁移脚本

1. 读取旧 Markdown 字段；
2. 通过 Content Compiler 转换为 Lesson AST；
3. 写入 content JSONB 字段；
4. 设置 ast_version = 1。

### 7.3 最终状态

迁移完成后，删除旧 Markdown 字段：

```sql
ALTER TABLE lessons
  DROP COLUMN body,
  DROP COLUMN intro,
  DROP COLUMN summary_text,
  DROP COLUMN objectives,
  DROP COLUMN notes;
```

---

## 8. 未来扩展

此架构天然支持以下扩展，无需修改数据库结构：

| 扩展 | 实现方式 |
|---|---|
| Markdown 导入 | Content Compiler 新增 Markdown 解析器 |
| 可视化编辑器 | 编辑器输出 Lesson AST JSON |
| AI 生成课程 | AI 输出 Lesson AST JSON |
| Word 导入 | Content Compiler 新增 Word 解析器 |
| PPT 导入 | Content Compiler 新增 PPT 解析器 |
| PDF 导出 | 新增 PDF Renderer，消费 Lesson AST |
| 多语言 | Lesson AST 增加 locale 字段 |
| 移动端 | 移动端 Renderer 消费同一份 Lesson AST |

---

## 9. 实施阶段

### 阶段 1：类型基础

- 定义 Lesson AST TypeScript 类型（`shared/lessonAST.ts`）
- 实现 Content Compiler（`compileMarkdown`）
- 实现 Repository / Service / API 适配

### 阶段 2：数据层

- Schema 新增 content JSONB 列
- Repository 适配（读取 content 字段）
- Service 去除 Markdown 渲染逻辑

### 阶段 3：渲染层

- 主项目移除 Markdown Engine
- Renderer 改为 AST 驱动
- 创建各 Block 对应的 Vue 组件
- 文本类 Block 通过 `InlineRenderer` 渲染 `children: Inline[]`，不使用 `v-html`
- FormulaBlock 调用 KaTeX API 渲染 LaTeX

### 阶段 4：API + 页面

- API 返回 Lesson AST
- Composable 适配新数据结构
- 页面适配新 Renderer

---

## 10. 与现有 ADR 的关系

本规范**取代** ADR-0009（Content Rendering Responsibility）中关于“Service 层负责 Markdown → HTML”的决策。

新决策：
- Content Compiler（`dexinlabs-content/compiler/`）负责 Markdown → Lesson AST，文本字段编译为 `Inline[]` 语义节点；
- 主项目（dexinlabs）不包含任何 Markdown 渲染能力，也不包含 Compiler 代码；
- Service 不再负责 Markdown 渲染；
- Renderer 按 Block 类型分发，文本类 Block 通过 `InlineRenderer` 渲染 `Inline[]`，FormulaBlock 调用 KaTeX API。

> 所有类型定义以 `shared/lessonAST.ts` 为唯一事实来源。本文档如与代码冲突，以代码为准。

---

## Related Documents

- [01-Architecture](./handbook/01-ARCHITECTURE.md) — 模块职责定义
- [LDS](./LDS.md) — 课时设计规范
- [ADR-0009](./decisions/ADR-0009-content-rendering-responsibility.md) — 已被本规范取代（Status: Superseded）
- [ADR-0010](./decisions/ADR-0010-lesson-ast-storage.md) — Lesson AST 存储
- [ADR-0013](./decisions/ADR-0013-compile-dexinlabs.md) — 合并内容仓库 / Compiler / 预览
- [ADR-0014](./decisions/ADR-0014-Markdown-frontmatter.md) — Markdown frontmatter 规范
