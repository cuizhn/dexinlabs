/**
 * Parser AST — Parser 内部实现私有类型（IMPLEMENTATION Decision 3）。
 *
 * 本文件只属于 Parser 层。Engine 其他模块（Transformer / Compiler / Plugin）
 * 禁止 import 本文件任何类型。Parser 输出必须经过 AST Adapter 转换为 Internal AST。
 */

export interface MarkedToken {
  type: string
  raw?: string
  text?: string
  depth?: number
  lang?: string
  ordered?: boolean
  start?: number | string
  loose?: boolean
  items?: MarkedToken[]
  tokens?: MarkedToken[]
  href?: string
  title?: string
  align?: string[]
  header?: MarkedToken[]
  rows?: MarkedToken[][]
  task?: boolean
  checked?: boolean
  [key: string]: unknown
}

export type ParserTokenTree = MarkedToken[]

export interface ParserOutput {
  tokens: ParserTokenTree
  content: string
  frontmatter: Record<string, unknown>
  source: 'marked-lexer'
}
