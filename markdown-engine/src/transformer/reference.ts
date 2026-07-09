/**
 * Reference transformer — initializes references collection.
 * Migrated from app/render/transformers/reference.js
 */
import type { TransformedRootAstNode, TransformerContext } from '../ast/types'

export const ReferenceTransformer = {
  async transform(ast: TransformedRootAstNode, context: TransformerContext = {}): Promise<TransformedRootAstNode> {
    if (ast) {
      ast.references = ast.references || []
      ;(ast as Record<string, unknown>).__referencesProcessed = true
    }
    return ast
  }
}

export default ReferenceTransformer
