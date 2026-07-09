/**
 * JSON Renderer Adapter — Render Tree → JSON string（IMPLEMENTATION Decision 4）。
 *
 * Decision 4：Render Tree 是平台无关的数据结构，JSON Adapter 直接序列化它。
 * 用于跨进程传输、SSR 预计算缓存、CLI 导出等场景。
 */
import type { RenderTree, RendererAdapterContext } from '../types/render-tree'

export interface RenderTreeJSONOptions {
  pretty?: boolean
  indent?: number
  [key: string]: unknown
}

export function renderTreeToJSON(
  tree: RenderTree,
  _context: RendererAdapterContext = {},
  opts: RenderTreeJSONOptions = {}
): string {
  const pretty = opts.pretty !== false
  const indent = typeof opts.indent === 'number' ? opts.indent : 2
  const safe = JSON.parse(JSON.stringify(tree))
  return pretty ? JSON.stringify(safe, null, indent) : JSON.stringify(safe)
}

export function parseJSONToRenderTree(json: string): RenderTree {
  return JSON.parse(json) as RenderTree
}

export default { renderTreeToJSON, parseJSONToRenderTree }
