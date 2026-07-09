/**
 * AST Adapter — Parser AST → Internal AST 转换模块（IMPLEMENTATION Decision 3）。
 *
 * 本模块是 Parser 层（marked.lexer 输出的 MarkedToken[]）和 Engine 核心（Internal AST）
 * 之间的唯一桥梁。Parser 专有数据结构（MarkedToken）只能出现在本文件，Engine 其他模块
 * 只能 import InternalAstNode / InternalRootAstNode，禁止直接操作 MarkedToken。
 *
 * 模块边界：
 *   ParserAST(MarkedToken[])
 *       ↓ 本模块
 *   InternalAST
 */
import type {
  AstNode,
  RootAstNode,
  HeadingNode,
  CodeNode,
  MathNode,
  LinkNode,
  ListNode
} from '../ast/types'
import type { MarkedToken, ParserTokenTree } from '../types/parser-ast'
import type { InternalAstNode, InternalRootAstNode } from '../types/internal-ast'

export function adapterConvertBlockTokens(tokens: ParserTokenTree): AstNode[] {
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
        children: adapterConvertInlineTokens(token.tokens || [{ type: 'text', text: token.text || '' }])
      } as HeadingNode

    case 'paragraph':
      return {
        type: 'paragraph',
        children: adapterConvertInlineTokens(token.tokens || [{ type: 'text', text: token.text || '' }])
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
        children: adapterConvertBlockTokens(token.tokens || [])
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
        return { type: 'paragraph', children: adapterConvertInlineTokens(token.tokens || [{ type: 'text', text: token.text }]) }
      }
      return null
  }
}

function convertListItem(item: MarkedToken): AstNode | null {
  if (!item) return null
  const children = adapterConvertBlockTokens(item.tokens || [])
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
    type: 'tableCell' as const,
    align: token.align?.[i] || null,
    children: adapterConvertInlineTokens(cell.tokens || [{ type: 'text' as const, text: cell.text || '' }])
  }))
  const rows = (token.rows || []).map(row => ({
    type: 'tableRow' as const,
    children: row.map((cell, i) => ({
      type: 'tableCell' as const,
      align: token.align?.[i] || null,
      children: adapterConvertInlineTokens(cell.tokens || [{ type: 'text' as const, text: cell.text || '' }])
    }))
  }))
  return {
    type: 'table',
    children: [{ type: 'tableRow', children: headerCells }, ...rows]
  }
}

export function adapterConvertInlineTokens(tokens: MarkedToken[]): AstNode[] {
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
        return { type: 'text', value: token.text || '', children: adapterConvertInlineTokens(token.tokens) }
      }
      return { type: 'text', value: token.text || '' }

    case 'strong':
      return { type: 'strong', children: adapterConvertInlineTokens(token.tokens || []) }

    case 'em':
      return { type: 'emphasis', children: adapterConvertInlineTokens(token.tokens || []) }

    case 'del':
      return { type: 'delete', children: adapterConvertInlineTokens(token.tokens || []) }

    case 'link':
      return {
        type: 'link',
        href: token.href || '',
        title: token.title || undefined,
        children: adapterConvertInlineTokens(token.tokens || [{ type: 'text', text: token.text || '' }])
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
 * 数学节点注入（Parser math 选项启用时调用）。
 * 只操作 Internal AST，不依赖 marked Token。
 */
export function adapterInjectMathNodes(children: InternalAstNode[]): void {
  for (const node of children) {
    if (node.children && Array.isArray(node.children)) {
      adapterInjectMathNodes(node.children)
    }
    if (typeof node.value === 'string') {
      const mathNodes = adapterExtractMathFromText(node.value)
      if (mathNodes) {
        const idx = children.indexOf(node)
        if (idx !== -1) {
          children.splice(idx, 1, ...mathNodes)
        }
      }
    }
  }
}

function adapterExtractMathFromText(text: string): AstNode[] | null {
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
      value: (match[1] ?? '').trim(),
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

/**
 * Parser → AST Adapter 主入口。
 * Parser 输出 tokens + content + frontmatter，在这里合成 InternalRootAstNode。
 */
export function buildInternalRoot(
  tokens: ParserTokenTree,
  content: string,
  frontmatter: Record<string, unknown>,
  meta: { source: 'marked-lexer' | 'passthrough'; parseError?: string; parsedAt?: number; passthrough?: boolean }
): InternalRootAstNode {
  const children = meta.passthrough
    ? [{ type: 'text' as const, value: content }]
    : adapterConvertBlockTokens(tokens)
  const root: InternalRootAstNode = {
    type: 'root',
    children,
    frontmatter,
    content
  } as InternalRootAstNode
  if (meta.source === 'marked-lexer') {
    ;(root as RootAstNode).__parseSource = 'marked-lexer'
    ;(root as RootAstNode).__parsedAt = meta.parsedAt || Date.now()
  }
  if (meta.parseError) {
    ;(root as RootAstNode).__parseError = meta.parseError
    ;(root as RootAstNode).__passthrough = true
  }
  if (meta.passthrough) {
    ;(root as RootAstNode).__passthrough = true
  }
  return root
}

export default {
  adapterConvertBlockTokens,
  adapterConvertInlineTokens,
  adapterInjectMathNodes,
  buildInternalRoot
}
