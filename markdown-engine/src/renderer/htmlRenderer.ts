/**
 * HTML Renderer — AST → HTML string.
 *
 * v1 strategy: delegates to marked.parse(ast.content) to guarantee GFM/table/code
 * quality. The engine owns the rendering responsibility (Vue no longer calls marked
 * directly). A future v2 can replace this with a full AST→HTML walker.
 *
 * Heading IDs are injected via marked v18's renderer API (heading receives a
 * token object { tokens, depth }), using the same slugifyHeading as the heading
 * transformer to keep HTML IDs consistent with AST IDs.
 */
import { marked } from 'marked'
import { slugifyHeading } from '../transformer/heading'
import type { TransformedRootAstNode, RendererContext } from '../ast/types'

marked.use({
  renderer: {
    heading(this: any, { tokens, depth }: { tokens: any[]; depth: number }): string {
      const text = this.parser.parseInline(tokens)
      const plainText = String(text).replace(/<[^>]+>/g, '')
      const id = slugifyHeading(plainText)
      return `<h${depth} id="${id}">${text}</h${depth}>\n`
    }
  }
})

export async function renderToHTML(
  ast: TransformedRootAstNode,
  context: RendererContext = {}
): Promise<string> {
  if (!ast) return ''

  const content = typeof ast.content === 'string' ? ast.content : ''
  if (!content) return ''

  try {
    return marked.parse(content) as string
  } catch {
    return escapeHtml(content)
  }
}

function escapeHtml(s: string = ''): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export const HTMLRenderer = {
  name: 'html-renderer',
  renderToHTML
}

export default HTMLRenderer
