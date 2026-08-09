# Lesson AST 设计规范

> Version: 1.0
> Status: Draft
> Date: 2026-08-05

---

## 1. 核心原则

**数据库保存的是课程结构（Lesson AST），而不是编辑格式。**

编辑格式（Markdown、富文本、AI 输出等）属于输入层。Content Compiler 是唯一允许将编辑内容转换为 Lesson AST 的模块。所有后续模块（Repository、Service、API、Renderer）均以 Lesson AST 为唯一数据来源，不直接依赖 Markdown。

---

## 2. 内容流水线

```
作者 / Markdown / 可视化编辑器 / AI / Word / PDF
    │
    ▼
Content Compiler（唯一入口）
    │
    ▼
Lesson JSON（AST）
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
API（返回 Lesson JSON）
    │
    ▼
Renderer（Block → Vue Component）
```

---

## 3. AST 结构定义

### 3.1 顶层结构

```typescript
/** 课时内容的顶层结构 */
interface LessonContent {
  /** AST 版本号，用于未来数据迁移 */
  version: 1
  /** 有序的 Block 列表 */
  blocks: Block[]
}
```

### 3.2 Block 联合类型

所有 Block 共享 `type` 和可选 `id` 字段，通过 `type` 区分：

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

### 3.3 各 Block 详细定义

#### 基础接口

```typescript
/** 所有 Block 的公共字段 */
interface BaseBlock {
  /** Block 唯一标识（可选，用于编辑器和锚点） */
  id?: string
  /** Block 类型标识 */
  type: string
}
```

#### 文本类 Block

文本类 Block 的 `content` 字段为 **行内 HTML 字符串**，由 Content Compiler（dexinlabs-content）在编译阶段将 Markdown 行内语法（加粗、斜体、行内公式、链接等）编译为 HTML。主项目通过 `v-html` 直接输出，不做任何 Markdown 解析。

```typescript
/** 段落 */
interface ParagraphBlock extends BaseBlock {
  type: 'paragraph'
  /** 行内 HTML（compiler 编译输出） */
  content: string
}

/** 标题 */
interface HeadingBlock extends BaseBlock {
  type: 'heading'
  /** 标题层级 1-4 */
  level: 1 | 2 | 3 | 4
  /** 行内 HTML（compiler 编译输出） */
  content: string
}

/** 引用 */
interface QuoteBlock extends BaseBlock {
  type: 'quote'
  /** HTML 内容（compiler 编译输出，可含多段） */
  content: string
}

/** 提示 / 注意 / 警告 */
interface HintBlock extends BaseBlock {
  type: 'hint'
  /** 提示级别 */
  level: 'info' | 'tip' | 'warning' | 'danger'
  /** HTML 内容（compiler 编译输出） */
  content: string
}
```

#### 媒体类 Block

```typescript
/** 图片 */
interface ImageBlock extends BaseBlock {
  type: 'image'
  /** 图片地址 */
  src: string
  /** 替代文本 */
  alt: string
  /** 图片说明 */
  caption?: string
}

/** 代码块 */
interface CodeBlock extends BaseBlock {
  type: 'code'
  /** 编程语言 */
  language: string
  /** 代码内容（纯文本，非 Markdown） */
  code: string
}
```

#### 数学类 Block

```typescript
/** 数学公式（块级） */
interface FormulaBlock extends BaseBlock {
  type: 'formula'
  /** LaTeX 表达式 */
  latex: string
  /** 是否块级展示（true = display mode，false = inline mode） */
  display: boolean
}
```

#### 结构化 Block

```typescript
/** 列表 */
interface ListBlock extends BaseBlock {
  type: 'list'
  /** 是否有序列表 */
  ordered: boolean
  /** 列表项，每项为行内 HTML（compiler 编译输出） */
  items: string[]
}

/** 表格 */
interface TableBlock extends BaseBlock {
  type: 'table'
  /** 表头单元格（行内 HTML，compiler 编译输出） */
  headers: string[]
  /** 表格数据行，每行为单元格数组 */
  rows: string[][]
}
```

#### 教学类 Block

教学类 Block 是教育场景的核心扩展，用于定义、示例、练习等结构化教学内容。

```typescript
/** 定义（术语解释） */
interface DefinitionBlock extends BaseBlock {
  type: 'definition'
  /** 术语名称 */
  term: string
  /** 定义内容（行内 HTML，compiler 编译输出） */
  content: string
}

/** 示例 */
interface ExampleBlock extends BaseBlock {
  type: 'example'
  /** 示例标题（可选） */
  title?: string
  /** 示例内容（行内 HTML，compiler 编译输出） */
  content: string
}

/** 练习题 / 思考题 */
interface QuestionBlock extends BaseBlock {
  type: 'question'
  /** 题目内容（行内 HTML，compiler 编译输出） */
  prompt: string
  /** 提示（行内 HTML，可选） */
  hint?: string
  /** 答案（行内 HTML，可选） */
  answer?: string
  /** 解析（行内 HTML，可选） */
  analysis?: string
}
```

#### 组织类 Block

```typescript
/** 分区（唯一可嵌套的 Block） */
interface SectionBlock extends BaseBlock {
  type: 'section'
  /** 分区标题 */
  title: string
  /** 子 Block 列表（可递归嵌套） */
  blocks: Block[]
}

/** 分隔线 */
interface DividerBlock extends BaseBlock {
  type: 'divider'
}
```

---

## 4. 设计决策

### 4.1 文本 Block 的 content 为什么是行内 HTML？

Block 的 `content` 字段存储 Content Compiler 编译后的行内 HTML，而非 Markdown 或纯文本：

- **主项目零 Markdown 依赖**：主项目不包含 remark/rehype/unified 等 Markdown 处理库，仅通过 `v-html` 直接输出
- **职责清晰**：Content Compiler（dexinlabs-content）负责 Markdown → HTML 编译，主项目只负责 AST → Vue 渲染
- **结构化保留**：块级结构由 Block 类型系统表达（段落、标题、列表、表格等），文本字段仅存储行内 HTML
- **确定性**：行内 HTML 的语法有限（bold/italic/code/link/math），渲染结果确定

**关键约束**：文本 Block 的 content 只包含行内 HTML（加粗、斜体、代码、链接、公式等），不包含块级标签。块级结构由 Block 类型系统表达。

### 4.2 为什么只有 Section 可以嵌套？

- 简化 AST 结构，避免任意嵌套带来的复杂度
- Section 是唯一的"分组"语义，其他 Block 都是叶子节点
- Renderer 只需处理一层遍历 + Section 递归

### 4.3 为什么块级结构用 AST 而非整篇 HTML？

- 纯 HTML 丢失语义信息（无法区分“定义”和“示例”）
- 纯 HTML 不利于编辑、搜索、分析
- 纯 HTML 不利于多端输出（Web / PDF / 移动端）
- AST 保留结构语义，文本字段存储行内 HTML 仅用于最终渲染

### 4.4 版本号的作用

`version: 1` 为未来 AST 结构变更提供迁移依据。当 Block 结构需要调整时：

1. 递增 version 号
2. 编写迁移函数（v1 → v2）
3. Content Compiler 输出最新版本
4. Repository 读取时根据 version 选择是否迁移

---

## 5. Content Compiler

### 5.1 职责

Content Compiler 是**唯一**允许将外部内容转换为 Lesson AST 的模块：

- Markdown → Lesson AST
- 可视化编辑器 → Lesson AST
- AI 输出 → Lesson AST
- Word / PDF 导入 → Lesson AST（未来）

### 5.2 模块结构

```
app/content/compiler/
  ├── compileLesson.ts      # Markdown → Lesson AST 主入口
  ├── validateLesson.ts     # AST 结构校验
  ├── normalizeLesson.ts    # AST 规范化（清理、补全默认值）
  └── index.ts              # 公共导出
```

### 5.3 Markdown 编译规则

| Markdown 语法 | 目标 Block |
|---|---|
| 普通段落 | `ParagraphBlock` |
| `#` ~ `####` | `HeadingBlock` |
| `> 引用` | `QuoteBlock` |
| `$$ ... $$` | `FormulaBlock` |
| ` ``` ` 代码块 | `CodeBlock` |
| `![alt](src)` | `ImageBlock` |
| `- item` / `1. item` | `ListBlock` |
| `\| table \|` | `TableBlock` |
| `::: hint` 容器 | `HintBlock` |
| `::: definition` 容器 | `DefinitionBlock` |
| `::: example` 容器 | `ExampleBlock` |
| `::: question` 容器 | `QuestionBlock` |
| `---` 分隔线 | `DividerBlock` |
| `## 标题` + 后续内容 | `SectionBlock`（标题作为 section.title） |

### 5.4 不得负责

- HTML 渲染
- Vue 组件
- 页面展示
- 数据库操作

---

## 6. 各层职责变更

### 6.1 Markdown Engine（已移除）

主项目（dexinlabs）已完全移除 Markdown Engine（remark/rehype/unified 管线）。

行内 Markdown → HTML 的编译职责已转移至 **dexinlabs-content** 项目的 Content Compiler。主项目只消费编译完成的行内 HTML，通过 `v-html` 直接输出。

### 6.2 Repository（简化）

**变更前**：读取多个 Markdown 字段（body, intro, summaryText, objectives, notes）

**变更后**：读取单个 JSONB 字段（content）

```typescript
// lessons 表
{
  id: number
  slug: string
  title: string
  content: LessonContent  // JSONB，Lesson AST
  version: number
  topic: string
  topicId: number
  order: number
  createdAt: Date
  updatedAt: Date
}
```

Repository 只负责查询 / 保存 / 更新，不做任何解析。

### 6.3 Service（简化）

**变更前**：调用 renderToHTML 渲染多个 Markdown 字段 → 组装 LessonPage

**变更后**：接收 Lesson AST，组装课程数据，不做 Markdown 编译

Service 负责：
- 课程组装（关联 Topic、Domain、导航）
- 学习状态
- 权限
- 业务数据组合

### 6.4 API（变更）

**变更前**：返回含 bodyHtml / introHtml 等预渲染字段的数据

**变更后**：返回 Lesson AST（content 字段）

### 6.5 Renderer（重构）

**变更前**：接收 `html: string`，用 `v-html` 渲染

**变更后**：接收 `blocks: Block[]`，按 Block 类型分发到 Vue 组件

```
Renderer
  │
  ├─ ParagraphBlock → Paragraph.vue
  ├─ HeadingBlock   → Heading.vue
  ├─ ImageBlock     → ImageBlock.vue
  ├─ ListBlock      → ListBlock.vue
  ├─ TableBlock     → TableBlock.vue
  ├─ FormulaBlock   → FormulaBlock.vue
  ├─ CodeBlock      → CodeBlock.vue
  ├─ QuoteBlock     → QuoteBlock.vue
  ├─ HintBlock      → HintBlock.vue
  ├─ DefinitionBlock→ DefinitionBlock.vue
  ├─ ExampleBlock   → ExampleBlock.vue
  ├─ QuestionBlock  → QuestionBlock.vue
  ├─ SectionBlock   → SectionBlock.vue（递归渲染子 blocks）
  └─ DividerBlock   → DividerBlock.vue
```

每个 Block 组件：
- 接收该类型 Block 的 props
- 文本类 Block 的 content 为行内 HTML，直接通过 `v-html` 输出
- FormulaBlock 直接调用 KaTeX API 渲染 LaTeX
- 纯结构化 Block（Image、Divider）直接渲染

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

编写一次性迁移脚本：

1. 读取旧 Markdown 字段
2. 通过 Content Compiler 转换为 Lesson AST
3. 写入 content JSONB 字段
4. 设置 ast_version = 1

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

- 定义 Lesson AST TypeScript 类型
- 实现 validateLesson（AST 校验器）
- 实现 normalizeLesson（AST 规范化）
- 实现 compileLesson（Markdown → AST）

### 阶段 2：数据层

- Schema 新增 content JSONB 列
- Repository 适配（读取 content 字段）
- Service 去除 Markdown 渲染逻辑

### 阶段 3：渲染层

- 主项目移除 Markdown Engine（remark/rehype/unified 管线）
- Renderer 改为 AST 驱动
- 创建各 Block 对应的 Vue 组件
- 文本类 Block 直接通过 `v-html` 输出 compiler 编译的行内 HTML
- FormulaBlock 直接调用 KaTeX API 渲染 LaTeX

### 阶段 4：API + 页面

- API 返回 Lesson AST
- Composable 适配新数据结构
- 页面适配新 Renderer

---

## 10. 与现有 ADR 的关系

本规范**取代** ADR-0009（Content Rendering Responsibility）中关于"Service 层负责 Markdown → HTML"的决策。

新决策：
- Content Compiler（dexinlabs-content）负责 Markdown → Lesson AST，文本字段编译为行内 HTML
- 主项目（dexinlabs）不包含任何 Markdown 解析/编译能力
- Service 不再负责 Markdown 渲染
- Renderer 按 Block 类型分发，文本类 Block 通过 `v-html` 直接输出行内 HTML，FormulaBlock 调用 KaTeX API

---

## Related Documents

- [01-Architecture](./handbook/01-ARCHITECTURE.md) — 模块职责定义
- [LDS](./LDS.md) — 课时设计规范
- [ADR-0009](./decisions/ADR-0009-content-rendering-responsibility.md) — 被本规范取代
