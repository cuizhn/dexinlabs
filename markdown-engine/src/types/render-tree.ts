/**
 * Render Tree — Cross-Platform Rendering Protocol (IMPLEMENTATION Decision 1 + 4).
 *
 * Render Tree 是平台无关的数据结构：
 *   Internal AST → Compiler（D1）→ Render Tree → Renderer Adapter（D4）→ Vue / HTML / JSON
 *
 * Render Tree 设计原则：
 *   ① 不包含任何 UI 框架术语（无 VNode / createElement / h 函数）
 *   ② 节点属性扁平（props 用 PascalCase-free 的字符串 key-value）
 *   ③ 纯 JSON 可序列化（无函数 / Promise / Symbol）
 *   ④ 三端共享（Vue / HTML / JSON 必须 100% 消费同一棵 Render Tree，无字段差异）
 */

export type RenderNodeType =
  | 'Root'
  | 'Heading'
  | 'Paragraph'
  | 'Text'
  | 'Strong'
  | 'Emphasis'
  | 'Delete'
  | 'Link'
  | 'Image'
  | 'List'
  | 'ListItem'
  | 'Code'
  | 'InlineCode'
  | 'Blockquote'
  | 'ThematicBreak'
  | 'Html'
  | 'Math'
  | 'InlineMath'
  | 'Table'
  | 'TableRow'
  | 'TableCell'
  | string

export interface RenderNode {
  type: RenderNodeType
  props?: Record<string, unknown>
  children?: RenderNode[] | string
}

export interface RenderRoot extends RenderNode {
  type: 'Root'
  props: {
    theme?: string
    class?: string[]
    [key: string]: unknown
  }
  children: RenderNode[]
}

export type RenderTree = RenderRoot | RenderNode[]

export interface RendererAdapterContext {
  slug?: string
  type?: string
  components?: Record<string, unknown>
  theme?: string
  basePath?: string
  highlight?: boolean
  [key: string]: unknown
}
