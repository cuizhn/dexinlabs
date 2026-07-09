/**
 * VNode Renderer — Backward-Compatibility Thin Facade (IMPLEMENTATION Decision 1 + 4).
 *
 * Decision 1 强制：禁止 Renderer 直接遍历 Internal AST。
 * Decision 4 强制：Renderer Adapter 只消费 Render Tree。
 * 本模块是旧 vnodeRenderer 的兼容层（pipeline.ts 仍然调用 renderToVNode(ast, ctx)）。
 *
 * 新流程（本模块内部）：
 *   TransformedRootAstNode
 *       ↓ 调 Compiler（Decision 1）
 *   Render Tree（平台无关）
 *       ↓ 调 vnodeAdapter（Decision 4）
 *   VNode tree（严格对齐旧 vnodeRenderer 输出结构，100% 兼容）
 *
 * 对外签名与返回值 100% 不变，Pipeline 与 Vue 层零感知。
 */
import type {
  TransformedRootAstNode,
  VNode,
  RendererContext
} from '../ast/types'
import { compileToRenderTree } from '../compiler/index'
import { renderTreeToVNode } from '../adapters/vnodeAdapter'

export async function renderToVNode(
  ast: TransformedRootAstNode,
  context: RendererContext = {}
): Promise<VNode | null> {
  if (!ast) return null
  const tree = compileToRenderTree(ast, { theme: context.theme })
  return renderTreeToVNode(tree, context)
}

export const VNodeRenderer = {
  name: 'vnode-renderer',
  renderToVNode
}

export default VNodeRenderer
