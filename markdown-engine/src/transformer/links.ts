/**
 * Links transformer — rewrites internal/external links.
 * Migrated from app/render/transformers/links.js
 */
import type { TransformedRootAstNode, TransformerContext } from '../ast/types'

export const LinksTransformer = {
  async transform(ast: TransformedRootAstNode, context: TransformerContext = {}): Promise<TransformedRootAstNode> {
    const rewrite = (node: Record<string, unknown> | null | undefined) => {
      if (!node) return
      if (node.type === 'link' && typeof node.href === 'string') {
        if (node.href.startsWith('/') && !node.href.startsWith('/api')) {
          node.__rewrite = 'internal-route'
        } else if (/^https?:\/\//.test(node.href)) {
          node.target = node.target || '_blank'
          node.rel = node.rel || 'noopener noreferrer'
          node.__rewrite = 'external'
        }
      }
      if (Array.isArray(node.children)) node.children.forEach(rewrite)
    }
    if (ast && Array.isArray(ast.children)) {
      ast.children.forEach(n => rewrite(n as Record<string, unknown>))
    }
    if (ast) (ast as Record<string, unknown>).__linksProcessed = true
    return ast
  }
}

export default LinksTransformer
