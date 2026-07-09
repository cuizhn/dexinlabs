import type { AstNode } from '../ast/types'

export function extractTextFromNode(node: AstNode | null | undefined): string {
  if (!node) return ''
  if (typeof node.value === 'string') return node.value
  if (Array.isArray(node.children)) {
    return node.children.map(child => extractTextFromNode(child)).join('')
  }
  return ''
}

export default extractTextFromNode
