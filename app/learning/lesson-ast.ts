/**
 * Lesson AST 类型定义与常量
 *
 * ⚠️ SOURCE OF TRUTH: dexinlabs-content/src/types/ast.ts
 * 本文件是只读副本，用于渲染端类型引用。AST 结构变更时需在 dexinlabs-content 中更新后同步。
 *
 * 定义课时内容的结构化表示（Lesson AST），
 * 数据库以 JSONB 存储此结构，所有输入方式（Markdown、编辑器、AI）
 * 均通过 Content Compiler（dexinlabs-content）转换为此格式。
 * 文本类 Block 的 content 为 compiler 输出的行内 HTML。
 *
 * 设计规范：standards/LESSON_AST.md
 * 架构决策：standards/decisions/ADR-0010-lesson-ast-storage.md
 *
 * 设计原则：
 * - Block 联合类型通过 type 字段区分
 * - 仅 SectionBlock 可嵌套，其余均为叶子节点
 * - 文本类 Block 的 content 为行内 HTML（compiler 编译输出）
 * - version 字段支持未来结构迁移
 */

// ────────────────────────────────────────────
// 顶层结构
// ────────────────────────────────────────────

/**
 * LessonContent - 课时内容的顶层 AST 结构
 *
 * 数据库 lessons.content 字段存储此结构的 JSON 序列化。
 * version 用于未来 AST 结构变更时的数据迁移。
 */
export interface LessonContent {
  /** AST 版本号，当前为 1 */
  version: 1
  /** 有序的 Block 列表 */
  blocks: Block[]
}

// ────────────────────────────────────────────
// Block 基础接口
// ────────────────────────────────────────────

/**
 * BaseBlock - 所有 Block 的公共字段
 *
 * id 为可选标识符，用于编辑器锚点和 Block 级操作。
 */
export interface BaseBlock {
  /** Block 唯一标识（可选） */
  id?: string
  /** Block 类型标识 */
  type: string
}

// ────────────────────────────────────────────
// 文本类 Block
// ────────────────────────────────────────────

/**
 * ParagraphBlock - 段落
 *
 * 最基本的文本块，content 为行内 HTML。
 */
export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph'
  /** 行内 HTML（compiler 编译输出，支持 bold/italic/code/link/math 等） */
  content: string
}

/**
 * HeadingBlock - 标题
 *
 * 支持 1-4 级标题，对应 h2-h5（h1 由课时 title 字段承担）。
 */
export interface HeadingBlock extends BaseBlock {
  type: 'heading'
  /** 标题层级 1-4 */
  level: 1 | 2 | 3 | 4
  /** 行内 HTML（compiler 编译输出） */
  content: string
}

/**
 * QuoteBlock - 引用
 *
 * 用于引述外部内容或重要说明。
 */
export interface QuoteBlock extends BaseBlock {
  type: 'quote'
  /** HTML 内容（compiler 编译输出，可含多段） */
  content: string
}

/**
 * HintBlock - 提示 / 注意 / 警告
 *
 * 教学场景中的提示框，支持不同级别。
 */
export interface HintBlock extends BaseBlock {
  type: 'hint'
  /** 提示级别：info（信息）、tip（建议）、warning（警告）、danger（危险） */
  level: 'info' | 'tip' | 'warning' | 'danger'
  /** HTML 内容（compiler 编译输出） */
  content: string
}

// ────────────────────────────────────────────
// 媒体类 Block
// ────────────────────────────────────────────

/**
 * ImageBlock - 图片
 */
export interface ImageBlock extends BaseBlock {
  type: 'image'
  /** 图片地址 */
  src: string
  /** 替代文本（无障碍） */
  alt: string
  /** 图片说明文字（可选） */
  caption?: string
}

/**
 * CodeBlock - 代码块
 */
export interface CodeBlock extends BaseBlock {
  type: 'code'
  /** 编程语言（用于语法高亮） */
  language: string
  /** 代码内容（纯文本，非 Markdown） */
  code: string
}

// ────────────────────────────────────────────
// 数学类 Block
// ────────────────────────────────────────────

/**
 * FormulaBlock - 数学公式
 *
 * 块级公式使用 LaTeX 语法，通过 KaTeX 渲染。
 */
export interface FormulaBlock extends BaseBlock {
  type: 'formula'
  /** LaTeX 表达式 */
  latex: string
  /** 是否块级展示（true = display mode，false = inline mode） */
  display: boolean
}

// ────────────────────────────────────────────
// 结构化 Block
// ────────────────────────────────────────────

/**
 * ListBlock - 列表
 *
 * 支持有序和无序列表，每项为行内 HTML。
 */
export interface ListBlock extends BaseBlock {
  type: 'list'
  /** 是否有序列表 */
  ordered: boolean
  /** 列表项，每项为行内 HTML（compiler 编译输出） */
  items: string[]
}

/**
 * TableBlock - 表格
 *
 * 表头和单元格内容均为行内 HTML（compiler 编译输出）。
 */
export interface TableBlock extends BaseBlock {
  type: 'table'
  /** 表头单元格 */
  headers: string[]
  /** 数据行，每行为单元格数组 */
  rows: string[][]
}

// ────────────────────────────────────────────
// 教学类 Block
// ────────────────────────────────────────────

/**
 * DefinitionBlock - 定义（术语解释）
 *
 * 用于数学概念的精确定义，term 为术语名称，content 为定义内容。
 */
export interface DefinitionBlock extends BaseBlock {
  type: 'definition'
  /** 术语名称 */
  term: string
  /** 定义内容（行内 HTML，compiler 编译输出） */
  content: string
}

/**
 * ExampleBlock - 示例
 *
 * 用于展示解题过程、应用场景等教学内容。
 */
export interface ExampleBlock extends BaseBlock {
  type: 'example'
  /** 示例标题（可选，如"例 1"） */
  title?: string
  /** 示例内容（行内 HTML，compiler 编译输出） */
  content: string
}

/**
 * QuestionBlock - 练习题 / 思考题
 *
 * 教学互动环节，支持提示、答案、解析的渐进展示。
 */
export interface QuestionBlock extends BaseBlock {
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

// ────────────────────────────────────────────
// 组织类 Block
// ────────────────────────────────────────────

/**
 * SectionBlock - 分区
 *
 * 唯一可嵌套的 Block 类型，用于将内容组织为逻辑段落。
 * 典型用法：将 Markdown 的 h2 标题及其后续内容转换为一个 Section。
 */
export interface SectionBlock extends BaseBlock {
  type: 'section'
  /** 分区标题 */
  title: string
  /** 子 Block 列表（可递归嵌套） */
  blocks: Block[]
}

/**
 * DividerBlock - 分隔线
 *
 * 纯视觉分隔，无内容。
 */
export interface DividerBlock extends BaseBlock {
  type: 'divider'
}

// ────────────────────────────────────────────
// Block 联合类型
// ────────────────────────────────────────────

/**
 * Block - 所有内容块的联合类型
 *
 * 通过 type 字段区分具体 Block 类型，
 * TypeScript 可通过判别联合（Discriminated Union）自动收窄类型。
 */
export type Block =
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

/**
 * BlockType - 所有合法的 Block 类型字符串
 *
 * 用于校验和类型守卫。
 */
export type BlockType = Block['type']

// ────────────────────────────────────────────
// Exercise AST
// ────────────────────────────────────────────

/**
 * ExerciseContent - 练习内容的 AST 结构
 *
 * Exercise 有多个文本字段（body/description/hint/answer/analysis），
 * 每个字段独立存储为 LessonContent AST。
 * 与 LessonContent 共用 Block 类型系统，复用同一套渲染组件。
 */
export interface ExerciseContent {
  /** AST 版本号，当前为 1 */
  version: 1
  /** 题目正文 AST */
  body?: LessonContent | null
  /** 题目描述 AST */
  description?: LessonContent | null
  /** 提示 AST */
  hint?: LessonContent | null
  /** 答案 AST */
  answer?: LessonContent | null
  /** 解析 AST */
  analysis?: LessonContent | null
}

// ────────────────────────────────────────────
// 运行时常量
// ────────────────────────────────────────────

/**
 * BLOCK_TYPES - 所有合法 Block 类型的运行时常量
 */
export const BLOCK_TYPES: readonly BlockType[] = [
  'paragraph',
  'heading',
  'image',
  'list',
  'table',
  'formula',
  'code',
  'quote',
  'hint',
  'definition',
  'example',
  'question',
  'section',
  'divider'
] as const

/**
 * HINT_LEVELS - HintBlock 的合法级别
 */
export const HINT_LEVELS: readonly HintBlock['level'][] = [
  'info',
  'tip',
  'warning',
  'danger'
] as const

/**
 * HEADING_LEVELS - HeadingBlock 的合法层级
 */
export const HEADING_LEVELS: readonly HeadingBlock['level'][] = [
  1, 2, 3, 4
] as const
