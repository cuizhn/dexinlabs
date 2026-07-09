/**
 * HTML Renderer — Backward-Compatibility Thin Facade (IMPLEMENTATION Decision 1).
 *
 * Decision 1 强制：禁止 Renderer 直接遍历 Internal AST。
 * 本模块是旧 htmlRenderer 的兼容层（pipeline.ts 仍然调用 renderToHTML(ast, ctx)）。
 *
 * 新流程（本模块内部）：
 *   TransformedRootAstNode
 *       ↓ 调 Compiler（Decision 1）
 *   Render Tree（平台无关）
 *       ↓ 调 htmlAdapter（Decision 4）
 *   HTML string
 *
 * 对外签名与返回值 100% 不变，Pipeline 与业务层（Markdown.vue）零感知。
 */
import type { TransformedRootAstNode, RendererContext } from '../ast/types'
import { compileToRenderTree } from '../compiler/index'
import { renderTreeToHTML } from '../adapters/htmlAdapter'

export async function renderToHTML(
  ast: TransformedRootAstNode,
  context: RendererContext = {}
): Promise<string> {
  if (!ast) return ''
  const content = typeof ast.content === 'string' ? ast.content : ''
  if (!content) return ''

  try {
    const tree = compileToRenderTree(ast, { theme: context.theme })
    return renderTreeToHTML(tree, context)
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
