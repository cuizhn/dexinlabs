/**
 * Markdown Parser — Thin Facade (IMPLEMENTATION Decision 3).
 *
 * Decision 3 强制：Engine 不允许直接操作任何 Parser 专有 AST。
 * 本模块是 Parser 层薄壳，唯一职责：
 *   1. Parse Frontmatter
 *   2. marked.lexer() → Parser 专有 Token[]（Parser 内部实现，Engine 禁止直用）
 *   3. 调用 AST Adapter（src/adapter/ast-adapter.ts） → Internal AST
 *
 * 禁止：本模块不再包含任何 Token→AST 转换逻辑（所有转换在 ast-adapter.ts），
 *       转换逻辑泄漏到 Parser 外将违反 D3，Code Review 直接打回。
 */
import { marked } from 'marked'
import { parseFrontmatter } from './frontmatter'
import type { RootAstNode, ParserOptions } from '../ast/types'
import type { MarkedToken } from '../types/parser-ast'
import {
  adapterInjectMathNodes,
  buildInternalRoot
} from '../adapter/ast-adapter'

marked.setOptions({ gfm: true, breaks: true })

export async function parseMarkdown(
  raw: string,
  opts: ParserOptions = {}
): Promise<RootAstNode> {
  if (typeof raw !== 'string') {
    return buildInternalRoot(
      [],
      (raw as { body?: string; content?: string })?.body || (raw as { content?: string })?.content || '',
      (raw as { frontmatter?: Record<string, unknown> })?.frontmatter || {},
      { source: 'passthrough', passthrough: true }
    ) as RootAstNode
  }

  const parseFm = opts.parseFrontmatter !== false
  const { data: frontmatter, content } = parseFm ? parseFrontmatter(raw) : { data: {}, content: raw }

  try {
    const tokens = marked.lexer(content) as unknown as MarkedToken[]

    if (opts.math) {
      const temp = buildInternalRoot(tokens, content, frontmatter, { source: 'marked-lexer' })
      adapterInjectMathNodes(temp.children)
      ;(temp as RootAstNode).__parseSource = 'marked-lexer'
      ;(temp as RootAstNode).__parsedAt = Date.now()
      return temp as RootAstNode
    }

    return buildInternalRoot(tokens, content, frontmatter, {
      source: 'marked-lexer',
      parsedAt: Date.now()
    }) as RootAstNode
  } catch (e) {
    return buildInternalRoot([], content, frontmatter, {
      source: 'passthrough',
      parseError: e instanceof Error ? e.message : String(e),
      passthrough: true
    }) as RootAstNode
  }
}

export const MarkdownParser = {
  async parse(raw: string, opts: ParserOptions = {}): Promise<RootAstNode> {
    return parseMarkdown(raw, opts)
  }
}

export default MarkdownParser
