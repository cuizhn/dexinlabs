/**
 * TOC transformer — builds table of contents from heading nodes.
 * Migrated from app/render/transformers/toc.js
 */
import type { TransformedRootAstNode, TocEntry, TransformerContext, AstNode } from '../ast/types'
import { extractTextFromNode } from './utils'

export const TocTransformer = {
  async transform(ast: TransformedRootAstNode, context: TransformerContext = {}): Promise<TransformedRootAstNode> {
    const toc: TocEntry[] = []
    const walk = (node: Record<string, unknown> | null | undefined, depth: number = 0) => {
      if (!node || typeof node !== 'object') return
      if (node.type === 'heading') {
        toc.push({
          id: String(node.id || ''),
          level: Number(node.depth || depth),
          text: extractTextFromNode(node as AstNode)
        })
      }
      if (Array.isArray(node.children)) node.children.forEach(child => walk(child, depth + 1))
    }
    if (ast && Array.isArray(ast.children)) {
      ast.children.forEach(n => walk(n as Record<string, unknown>, 0))
    }
    if (ast) ast.toc = toc
    return ast
  }
}

export default TocTransformer
