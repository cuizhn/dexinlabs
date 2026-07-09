/**
 * VNode Renderer — AST → JSON VNode description tree.
 *
 * Per DESIGN.md: outputs framework-agnostic JSON VNode descriptions like
 * { type, props, is, children }. The Vue adapter receives this and maps
 * to actual components via <component :is="vnode.is">.
 */
import type {
  TransformedRootAstNode,
  TransformedAstNode,
  VNode,
  RendererContext
} from '../ast/types'

export async function renderToVNode(
  ast: TransformedRootAstNode,
  context: RendererContext = {}
): Promise<VNode | null> {
  if (!ast) return null
  const children = (ast.children || []).map(child => convertNode(child)).filter(Boolean) as VNode[]
  return {
    type: 'root',
    is: 'div',
    props: {
      class: ['ce-markdown', `ce-theme-${context.theme || 'default'}`],
      'data-md-root': true
    },
    children
  }
}

function convertNode(node: TransformedAstNode): VNode | null {
  if (!node || typeof node !== 'object') return null

  switch (node.type) {
    case 'heading':
      return {
        type: 'heading',
        is: `h${(node as Record<string, unknown>).depth || 1}`,
        props: { id: (node as Record<string, unknown>).id || undefined },
        children: convertChildren(node.children)
      }

    case 'paragraph':
      return {
        type: 'paragraph',
        is: 'p',
        children: convertChildren(node.children)
      }

    case 'text':
      return {
        type: 'text',
        is: '#text',
        props: { nodeValue: node.value || '' }
      }

    case 'strong':
      return { type: 'strong', is: 'strong', children: convertChildren(node.children) }

    case 'emphasis':
      return { type: 'emphasis', is: 'em', children: convertChildren(node.children) }

    case 'delete':
      return { type: 'delete', is: 'del', children: convertChildren(node.children) }

    case 'link':
      return {
        type: 'link',
        is: 'a',
        props: {
          href: (node as Record<string, unknown>).href || '',
          target: (node as Record<string, unknown>).target || undefined,
          rel: (node as Record<string, unknown>).rel || undefined,
          title: (node as Record<string, unknown>).title || undefined
        },
        children: convertChildren(node.children)
      }

    case 'image':
      return {
        type: 'image',
        is: 'img',
        props: {
          src: (node as Record<string, unknown>).url || (node as Record<string, unknown>).href || '',
          alt: node.value || (node as Record<string, unknown>).alt || ''
        }
      }

    case 'code':
      return {
        type: 'code',
        is: 'pre',
        props: { 'data-lang': (node as Record<string, unknown>).lang || '' },
        children: [{ type: 'code', is: 'code', props: { 'data-lang': (node as Record<string, unknown>).lang || '' }, children: [{ type: 'text', is: '#text', props: { nodeValue: node.value || '' } }] }]
      }

    case 'inlineCode':
      return { type: 'inlineCode', is: 'code', props: { nodeValue: node.value || '' } }

    case 'list':
      return {
        type: 'list',
        is: (node as Record<string, unknown>).ordered ? 'ol' : 'ul',
        children: convertChildren(node.children)
      }

    case 'listItem':
      return { type: 'listItem', is: 'li', children: convertChildren(node.children) }

    case 'blockquote':
      return { type: 'blockquote', is: 'blockquote', children: convertChildren(node.children) }

    case 'thematicBreak':
      return { type: 'thematicBreak', is: 'hr' }

    case 'html':
      return { type: 'html', is: 'div', props: { innerHTML: node.value || '' } }

    case 'math':
      return {
        type: 'math',
        is: 'KatexElement',
        props: { formula: node.value || '', display: true }
      }

    case 'inlineMath':
      return {
        type: 'inlineMath',
        is: 'KatexElement',
        props: { formula: node.value || '', display: false }
      }

    case 'table':
      return { type: 'table', is: 'table', children: convertChildren(node.children) }

    case 'tableRow':
      return { type: 'tableRow', is: 'tr', children: convertChildren(node.children) }

    case 'tableCell':
      return { type: 'tableCell', is: 'td', children: convertChildren(node.children) }

    default:
      return node.value != null
        ? { type: String(node.type || 'text'), is: '#text', props: { nodeValue: String(node.value) } }
        : null
  }
}

function convertChildren(children?: TransformedAstNode[]): VNode[] | string {
  if (!children || children.length === 0) return ''
  return children.map(child => convertNode(child)).filter(Boolean) as VNode[]
}

export const VNodeRenderer = {
  name: 'vnode-renderer',
  renderToVNode
}

export default VNodeRenderer
