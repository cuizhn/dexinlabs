/**
 * AST Type Definitions — MDAST-compatible with education extensions.
 *
 * Single source of truth for all node shapes used across the engine.
 * The app layer re-exports these from '@me/ast/types' to avoid duplication.
 */

export type AstNodeType =
  | 'root'
  | 'heading'
  | 'paragraph'
  | 'text'
  | 'link'
  | 'image'
  | 'list'
  | 'listItem'
  | 'code'
  | 'blockquote'
  | 'math'
  | 'table'
  | 'tableRow'
  | 'tableCell'
  | 'emphasis'
  | 'strong'
  | 'delete'
  | 'inlineCode'
  | 'inlineMath'
  | 'thematicBreak'
  | 'html'
  | 'concept'
  | 'exercise'
  | 'reference'
  | string

export interface AstNode {
  type: AstNodeType
  children?: AstNode[]
  value?: string
  [key: string]: unknown
}

export interface RootAstNode extends AstNode {
  type: 'root'
  children: AstNode[]
  frontmatter: Record<string, unknown>
  content: string
}

export interface HeadingNode extends AstNode {
  type: 'heading'
  depth: number
  id?: string
  children: AstNode[]
}

export interface CodeNode extends AstNode {
  type: 'code'
  lang?: string
  value: string
}

export interface MathNode extends AstNode {
  type: 'math' | 'inlineMath'
  value: string
  display: boolean
}

export interface LinkNode extends AstNode {
  type: 'link'
  href: string
  title?: string
  children: AstNode[]
  target?: string
  rel?: string
}

export interface ListNode extends AstNode {
  type: 'list'
  ordered: boolean
  children: AstNode[]
}

export interface ParserOptions {
  parseFrontmatter?: boolean
  allowDangerousHtml?: boolean
  math?: boolean
  [key: string]: unknown
}

export interface ParserOutputShape {
  type: 'root'
  children: AstNode[]
  frontmatter: Record<string, unknown>
  content: string
}

// ---- Transformer-related types ----

export interface TransformerContext {
  slug?: string
  type?: string
  basePath?: string
  excerptLimit?: number
  [key: string]: unknown
}

export interface TocEntry {
  id: string
  text: string
  level: number
  children?: TocEntry[]
}

export interface HeadingInfo {
  id: string
  text: string
  level: number
}

export interface LinkInfo {
  original: string
  resolved: string
  type: 'internal' | 'external' | 'asset'
}

export interface ReferenceInfo {
  id: string
  type: string
  label?: string
}

export interface ReadingTimeInfo {
  minutes: number
  seconds: number
  words: number
  cjkChars: number
  enWords: number
  cjkRate: number
}

export interface TransformerExtraData {
  toc?: TocEntry[]
  headings?: HeadingInfo[]
  links?: LinkInfo[]
  excerpt?: string
  readingTime?: ReadingTimeInfo
  readingTimeMinutes?: number
  references?: ReferenceInfo[]
  [key: string]: unknown
}

export interface TransformedAstNode extends AstNode {
  id?: string
  [key: string]: unknown
}

export interface TransformedRootAstNode extends RootAstNode {
  toc?: TocEntry[]
  excerpt?: string
  readingTime?: ReadingTimeInfo
  readingTimeMinutes?: number
  headings?: HeadingInfo[]
  links?: LinkInfo[]
  references?: ReferenceInfo[]
  children: TransformedAstNode[]
}

// ---- Renderer-related types ----

export interface RendererContext {
  slug?: string
  type?: string
  components?: Record<string, unknown>
  theme?: string
  basePath?: string
  highlight?: boolean
  [key: string]: unknown
}

/**
 * JSON VNode description — framework-agnostic.
 * The Vue adapter layer receives this and maps to actual Vue components
 * via <component :is="vnode.is">.
 */
export interface VNode {
  type: string
  is?: string
  props?: Record<string, unknown>
  children?: VNode[] | string
  [key: string]: unknown
}

export interface RenderedOutput {
  vnode?: VNode
  html?: string
  [key: string]: unknown
}
