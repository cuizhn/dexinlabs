/**
 * Markdown Parser — real Markdown → AST via marked.lexer.
 *
 * Uses marked's lexer to produce tokens, then converts to MDAST-compatible AST.
 * Replaces the old passthrough parser.
 */
import { marked } from 'marked'
import { parseFrontmatter } from './frontmatter'
import type {
  AstNode,
  RootAstNode,
  ParserOptions,
  HeadingNode,
  CodeNode,
  MathNode,
  LinkNode,
  ListNode
} from '../ast/types'

marked.setOptions({ gfm: true, breaks: true })

interface MarkedToken {
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

export async function parseMarkdown(
  raw: string,
  opts: ParserOptions = {}
): Promise<RootAstNode> {
  if (typeof raw !== 'string') {
    return {
      type: 'root',
      children: [],
      frontmatter: (raw as { frontmatter?: Record<string, unknown> })?.frontmatter || {},
      content: (raw as { body?: string; content?: string })?.body || (raw as { content?: string })?.content || '',
      __passthrough: true
    } as RootAstNode
  }

  const parseFm = opts.parseFrontmatter !== false
  const { data: frontmatter, content } = parseFm ? parseFrontmatter(raw) : { data: {}, content: raw }

  try {
    const tokens = marked.lexer(content) as unknown as MarkedToken[]
    const children = convertBlockTokens(tokens)

    if (opts.math) {
      injectMathNodes(children)
    }

    return {
      type: 'root',
      children,
      frontmatter,
      content,
      __parseSource: 'marked-lexer',
      __parsedAt: Date.now()
    }
  } catch (e) {
    return {
      type: 'root',
      children: [{ type: 'text', value: content }],
      frontmatter,
      content,
      __parseError: e instanceof Error ? e.message : String(e),
      __passthrough: true
    }
  }
}

function convertBlockTokens(tokens: MarkedToken[]): AstNode[] {
  const nodes: AstNode[] = []
  for (const token of tokens) {
    const node = convertBlockToken(token)
    if (node) nodes.push(node)
  }
  return nodes
}

function convertBlockToken(token: MarkedToken): AstNode | null {
  switch (token.type) {
    case 'heading':
      return {
        type: 'heading',
        depth: token.depth || 1,
        children: convertInlineTokens(token.tokens || [{ type: 'text', text: token.text || '' }])
      } as HeadingNode

    case 'paragraph':
      return {
        type: 'paragraph',
        children: convertInlineTokens(token.tokens || [{ type: 'text', text: token.text || '' }])
      }

    case 'code':
      return {
        type: 'code',
        lang: token.lang || '',
        value: token.text || ''
      } as CodeNode

    case 'blockquote':
      return {
        type: 'blockquote',
        children: convertBlockTokens(token.tokens || [])
      }

    case 'list':
      return {
        type: 'list',
        ordered: !!token.ordered,
        children: (token.items || []).map(item => convertListItem(item)).filter(Boolean) as AstNode[]
      } as ListNode

    case 'hr':
      return { type: 'thematicBreak' }

    case 'table':
      return convertTable(token)

    case 'html':
      return { type: 'html', value: token.text || token.raw || '' }

    case 'space':
      return null

    default:
      if (token.text) {
        return { type: 'paragraph', children: convertInlineTokens(token.tokens || [{ type: 'text', text: token.text }]) }
      }
      return null
  }
}

function convertListItem(item: MarkedToken): AstNode | null {
  if (!item) return null
  const children = convertBlockTokens(item.tokens || [])
  if (item.task) {
    return {
      type: 'listItem',
      checked: !!item.checked,
      children
    }
  }
  return { type: 'listItem', children }
}

function convertTable(token: MarkedToken): AstNode {
  const headerCells = (token.header || []).map((cell, i) => ({
    type: 'tableCell',
    align: token.align?.[i] || null,
    children: convertInlineTokens(cell.tokens || [{ type: 'text', text: cell.text || '' }])
  }))
  const rows = (token.rows || []).map(row => ({
    type: 'tableRow',
    children: row.map((cell, i) => ({
      type: 'tableCell',
      align: token.align?.[i] || null,
      children: convertInlineTokens(cell.tokens || [{ type: 'text', text: cell.text || '' }])
    }))
  }))
  return {
    type: 'table',
    children: [{ type: 'tableRow', children: headerCells }, ...rows]
  }
}

function convertInlineTokens(tokens: MarkedToken[]): AstNode[] {
  const nodes: AstNode[] = []
  for (const token of tokens) {
    const node = convertInlineToken(token)
    if (node) nodes.push(node)
  }
  return nodes.length > 0 ? nodes : [{ type: 'text', value: '' }]
}

function convertInlineToken(token: MarkedToken): AstNode | null {
  switch (token.type) {
    case 'text':
      if (token.tokens && token.tokens.length > 0) {
        return { type: 'text', value: token.text || '', children: convertInlineTokens(token.tokens) }
      }
      return { type: 'text', value: token.text || '' }

    case 'strong':
      return { type: 'strong', children: convertInlineTokens(token.tokens || []) }

    case 'em':
      return { type: 'emphasis', children: convertInlineTokens(token.tokens || []) }

    case 'del':
      return { type: 'delete', children: convertInlineTokens(token.tokens || []) }

    case 'link':
      return {
        type: 'link',
        href: token.href || '',
        title: token.title || undefined,
        children: convertInlineTokens(token.tokens || [{ type: 'text', text: token.text || '' }])
      } as LinkNode

    case 'image':
      return {
        type: 'image',
        url: token.href || '',
        alt: token.text || '',
        title: token.title || undefined
      }

    case 'codespan':
      return { type: 'inlineCode', value: token.text || '' }

    case 'br':
      return { type: 'html', value: '<br/>' }

    case 'escape':
      return { type: 'text', value: token.text || '' }

    case 'html':
      return { type: 'html', value: token.text || token.raw || '' }

    default:
      return token.text ? { type: 'text', value: token.text } : null
  }
}

/**
 * Walk the AST and split `$...$` / `$$...$$` math syntax into math nodes.
 * Called when opts.math is enabled.
 */
function injectMathNodes(children: AstNode[]): void {
  for (const node of children) {
    if (node.children && Array.isArray(node.children)) {
      injectMathNodes(node.children)
    }
    if (typeof node.value === 'string') {
      const mathNodes = extractMathFromText(node.value)
      if (mathNodes) {
        const idx = children.indexOf(node)
        if (idx !== -1) {
          children.splice(idx, 1, ...mathNodes)
        }
      }
    }
  }
}

function extractMathFromText(text: string): AstNode[] | null {
  if (!text.includes('$')) return null
  const nodes: AstNode[] = []
  let remaining = text
  let hasMath = false
  const displayRe = /\$\$([\s\S]+?)\$\$/
  const inlineRe = /\$([^\$\n]+?)\$/

  while (remaining.length > 0) {
    const displayMatch = remaining.match(displayRe)
    const inlineMatch = remaining.match(inlineRe)

    let match: RegExpMatchArray | null = null
    let display = false

    if (displayMatch && (!inlineMatch || (displayMatch.index ?? 0) <= (inlineMatch.index ?? 0))) {
      match = displayMatch
      display = true
    } else if (inlineMatch) {
      match = inlineMatch
      display = false
    }

    if (!match || match.index === undefined) break

    if (match.index > 0) {
      nodes.push({ type: 'text', value: remaining.slice(0, match.index) })
    }
    nodes.push({
      type: display ? 'math' : 'inlineMath',
      value: match[1].trim(),
      display
    } as MathNode)
    hasMath = true
    remaining = remaining.slice(match.index + match[0].length)
  }

  if (!hasMath) return null
  if (remaining.length > 0) {
    nodes.push({ type: 'text', value: remaining })
  }
  return nodes
}

export const MarkdownParser = {
  async parse(raw: string, opts: ParserOptions = {}): Promise<RootAstNode> {
    return parseMarkdown(raw, opts)
  }
}

export default MarkdownParser
