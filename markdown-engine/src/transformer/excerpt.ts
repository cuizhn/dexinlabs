/**
 * Excerpt transformer — extracts a plain-text excerpt from content.
 * Migrated from app/render/transformers/excerpt.js
 */
import type { TransformedRootAstNode, TransformerContext } from '../ast/types'

export const ExcerptTransformer = {
  async transform(ast: TransformedRootAstNode, context: TransformerContext = {}): Promise<TransformedRootAstNode> {
    const content = ast && typeof ast.content === 'string' ? ast.content : ''
    const plain = content.replace(/[#*`>\[\]\n]+/g, ' ').replace(/\s+/g, ' ').trim()
    const excerptLimit = (context.excerptLimit as number) || 140
    if (ast) {
      ast.excerpt = plain.length > excerptLimit ? plain.slice(0, excerptLimit) + '…' : plain
    }
    return ast
  }
}

export default ExcerptTransformer
