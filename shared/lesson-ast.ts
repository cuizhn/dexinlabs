/**
 * Lesson AST 类型定义 — 全项目共享的稳定数据契约
 *
 * SOURCE OF TRUTH: 本文件是 Lesson AST 的唯一定义。
 * Compiler、Content System、Frontend Renderer 必须共同引用本文件，禁止各自维护副本。
 *
 * 设计原则：
 * - LessonAST 保存语义，不保存最终 HTML
 * - 文本类 Block 使用 Inline[] 表达行内语义结构（bold/italic/code/link/math）
 * - FormulaBlock 保存 LaTeX 原文，由运行时 Renderer 调用 KaTeX 渲染
 * - 容器类 Block（quote/hint/definition/example）可包含子 Block，支持段落 + 公式等混合内容
 *
 * 设计规范：standards/LESSON_AST.md
 * 架构决策：standards/decisions/ADR-0010-lesson-ast-storage.md, ADR-0013-compile-dexinlabs.md
 */

// ────────────────────────────────────────────
// 顶层结构
// ────────────────────────────────────────────

export interface LessonContent {
  /** AST 版本号，当前为 1 */
  version: 1
  /** 有序的 Block 列表 */
  blocks: Block[]
}

// ────────────────────────────────────────────
// 行内内容（Inline）— 语义结构，非 HTML
// ────────────────────────────────────────────

export type Inline =
  | TextInline
  | BoldInline
  | ItalicInline
  | CodeInline
  | LinkInline
  | MathInline

export interface TextInline {
  type: 'text'
  value: string
}

export interface BoldInline {
  type: 'bold'
  children: Inline[]
}

export interface ItalicInline {
  type: 'italic'
  children: Inline[]
}

export interface CodeInline {
  type: 'code'
  value: string
}

export interface LinkInline {
  type: 'link'
  url: string
  children: Inline[]
}

/** 行内公式，保存 LaTeX 原文，由 Renderer 调用 KaTeX 渲染 */
export interface MathInline {
  type: 'math'
  latex: string
}

// ────────────────────────────────────────────
// Block 基础接口
// ────────────────────────────────────────────

export interface BaseBlock {
  /** Block 唯一标识（可选，用于编辑器锚点） */
  id?: string
  /** Block 类型标识 */
  type: string
}

// ────────────────────────────────────────────
// 文本类 Block
// ────────────────────────────────────────────

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph'
  children: Inline[]
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading'
  /** 标题层级 1-4（对应 h2-h5，h1 由课时 title 承担） */
  level: 1 | 2 | 3 | 4
  children: Inline[]
}

// ────────────────────────────────────────────
// 容器类 Block（可包含子 Block）
// ────────────────────────────────────────────

export interface QuoteBlock extends BaseBlock {
  type: 'quote'
  children: Block[]
}

export interface HintBlock extends BaseBlock {
  type: 'hint'
  level: 'info' | 'tip' | 'warning' | 'danger'
  children: Block[]
}

export interface DefinitionBlock extends BaseBlock {
  type: 'definition'
  term: string
  children: Block[]
}

export interface ExampleBlock extends BaseBlock {
  type: 'example'
  title?: string
  children: Block[]
}

export interface QuestionBlock extends BaseBlock {
  type: 'question'
  prompt: Block[]
  hint?: string
}

// ────────────────────────────────────────────
// 媒体类 Block
// ────────────────────────────────────────────

export interface ImageBlock extends BaseBlock {
  type: 'image'
  src: string
  alt: string
  caption?: string
}

export interface CodeBlock extends BaseBlock {
  type: 'code'
  language: string
  code: string
}

// ────────────────────────────────────────────
// 数学类 Block — 保存 LaTeX，不保存 HTML
// ────────────────────────────────────────────

export interface FormulaBlock extends BaseBlock {
  type: 'formula'
  latex: string
  display: boolean
}

// ────────────────────────────────────────────
// 结构化 Block
// ────────────────────────────────────────────

export interface ListBlock extends BaseBlock {
  type: 'list'
  ordered: boolean
  items: Inline[][]
}

export type TableCell = Inline[]

export interface TableBlock extends BaseBlock {
  type: 'table'
  headers: TableCell[]
  rows: TableCell[][]
}

// ────────────────────────────────────────────
// 组织类 Block
// ────────────────────────────────────────────

export interface SectionBlock extends BaseBlock {
  type: 'section'
  title: Inline[]
  blocks: Block[]
}

export interface DividerBlock extends BaseBlock {
  type: 'divider'
}

// ────────────────────────────────────────────
// Block 联合类型
// ────────────────────────────────────────────

export type Block =
  | ParagraphBlock
  | HeadingBlock
  | QuoteBlock
  | HintBlock
  | ImageBlock
  | CodeBlock
  | FormulaBlock
  | ListBlock
  | TableBlock
  | DefinitionBlock
  | ExampleBlock
  | QuestionBlock
  | SectionBlock
  | DividerBlock

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

export const HINT_LEVELS: readonly HintBlock['level'][] = [
  'info',
  'tip',
  'warning',
  'danger'
] as const

export const HEADING_LEVELS: readonly HeadingBlock['level'][] = [
  1, 2, 3, 4
] as const
