/**
 * Heading transformer — injects IDs into heading nodes.
 * Migrated from app/render/transformers/heading.js
 */
import type { TransformedRootAstNode, TransformerContext, AstNode, HeadingInfo } from '../ast/types'
import { extractTextFromNode } from './utils'

export function slugifyHeading(text: string = ''): string {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9_\-\u4e00-\u9fa5]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const HeadingTransformer = {
  async transform(ast: TransformedRootAstNode, context: TransformerContext = {}): Promise<TransformedRootAstNode> {
    if (!ast || (ast as Record<string, unknown>).__headingInjected) return ast
    let idCounter = 0
    const headings: HeadingInfo[] = []
    const inject = (node: Record<string, unknown> | null | undefined) => {
      if (!node || typeof node !== 'object') return
      if (node.type === 'heading' && !node.id) {
        const text = extractTextFromNode(node as AstNode)
        node.id = slugifyHeading(text) || `h-${idCounter++}`
        headings.push({
          id: String(node.id),
          text,
          level: Number(node.depth || 1)
        })
      }
      if (Array.isArray(node.children)) node.children.forEach(inject)
    }
    if (Array.isArray(ast.children)) ast.children.forEach(inject)
    ;(ast as Record<string, unknown>).__headingInjected = true
    ast.headings = headings
    return ast
  }
}

export default HeadingTransformer
