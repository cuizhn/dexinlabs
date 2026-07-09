/**
 * VNode Renderer Adapter — Render Tree → VNode（IMPLEMENTATION Decision 4）。
 *
 * Decision 4 强制：Adapter 只接受 Render Tree。
 *
 * 关键兼容性保证（CRUCIAL BACKWARD COMPATIBILITY）：
 *   本 Adapter 输出的 VNode 结构 **必须和旧 vnodeRenderer.ts 输出的 VNode 100% 完全一致**，
 *   这样 Pipeline 的返回值结构不变，上层 app/components/markdown/Markdown.vue（Vue Adapter）
 *   和 3 个业务页（study / lesson / exercise）零感知，无任何回归风险。
 *
 * 对应关系（RenderTree.type → 旧 VNode { type, is, props, children }）：
 *   Root        → { type: 'root', is: 'div', props: { class: [...], 'data-md-root': true } }
 *   Heading(2)  → { type: 'heading', is: 'h2', props: { id } }
 *   Text        → { type: 'text', is: '#text', props: { nodeValue: value } }
 *   Math        → { type: 'math', is: 'KatexElement', props: { formula, display: true } }
 *   ...所有节点严格对齐旧 vnodeRenderer 输出。
 */
import type { RenderNode, RenderRoot, RenderTree, RendererAdapterContext } from '../types/render-tree'
import type { VNode as EngineVNode } from '../ast/types'

export function renderTreeToVNode(
  tree: RenderTree,
  context: RendererAdapterContext = {}
): EngineVNode | null {
  const root: RenderRoot = Array.isArray(tree)
    ? { type: 'Root', props: { theme: context.theme || 'default' }, children: tree }
    : tree as RenderRoot
  return adaptRoot(root, context)
}

function adaptRoot(root: RenderRoot, context: RendererAdapterContext): EngineVNode {
  const children = (root.children || []).map(c => adaptNode(c)).filter(Boolean) as EngineVNode[]
  return {
    type: 'root',
    is: 'div',
    props: {
      class: Array.isArray(root.props?.class) ? root.props.class : ['ce-markdown', `ce-theme-${context.theme || 'default'}`],
      'data-md-root': true
    },
    children
  }
}

function adaptNode(node: RenderNode | string): EngineVNode | null {
  if (typeof node === 'string') {
    return { type: 'text', is: '#text', props: { nodeValue: node } }
  }
  if (!node || !node.type) return null

  switch (node.type) {
    case 'Heading': {
      const level = Number(node.props?.level || 1)
      return {
        type: 'heading',
        is: `h${level}`,
        props: { id: typeof node.props?.id === 'string' ? node.props.id : undefined },
        children: adaptChildren(node.children)
      } as EngineVNode
    }

    case 'Paragraph':
      return {
        type: 'paragraph',
        is: 'p',
        children: adaptChildren(node.children)
      } as EngineVNode

    case 'Text': {
      const value = typeof node.props?.value === 'string' ? node.props.value : ''
      return { type: 'text', is: '#text', props: { nodeValue: value } } as EngineVNode
    }

    case 'Strong':
      return { type: 'strong', is: 'strong', children: adaptChildren(node.children) } as EngineVNode

    case 'Emphasis':
      return { type: 'emphasis', is: 'em', children: adaptChildren(node.children) } as EngineVNode

    case 'Delete':
      return { type: 'delete', is: 'del', children: adaptChildren(node.children) } as EngineVNode

    case 'Link': {
      return {
        type: 'link',
        is: 'a',
        props: {
          href: String(node.props?.href || ''),
          target: typeof node.props?.target === 'string' ? node.props.target : undefined,
          rel: typeof node.props?.rel === 'string' ? node.props.rel : undefined,
          title: typeof node.props?.title === 'string' ? node.props.title : undefined
        },
        children: adaptChildren(node.children)
      } as EngineVNode
    }

    case 'Image': {
      return {
        type: 'image',
        is: 'img',
        props: {
          src: String(node.props?.src || ''),
          alt: String(node.props?.alt || '')
        }
      } as EngineVNode
    }

    case 'Code': {
      const lang = typeof node.props?.lang === 'string' ? node.props.lang : ''
      const value = typeof node.props?.value === 'string' ? node.props.value : ''
      return {
        type: 'code',
        is: 'pre',
        props: { 'data-lang': lang },
        children: [
          {
            type: 'code',
            is: 'code',
            props: { 'data-lang': lang },
            children: [{ type: 'text', is: '#text', props: { nodeValue: value } }]
          }
        ]
      } as EngineVNode
    }

    case 'InlineCode': {
      const value = typeof node.props?.value === 'string' ? node.props.value : ''
      return { type: 'inlineCode', is: 'code', props: { nodeValue: value } } as EngineVNode
    }

    case 'List': {
      const ordered = !!node.props?.ordered
      return {
        type: 'list',
        is: ordered ? 'ol' : 'ul',
        children: adaptChildren(node.children)
      } as EngineVNode
    }

    case 'ListItem':
      return { type: 'listItem', is: 'li', children: adaptChildren(node.children) } as EngineVNode

    case 'Blockquote':
      return { type: 'blockquote', is: 'blockquote', children: adaptChildren(node.children) } as EngineVNode

    case 'ThematicBreak':
      return { type: 'thematicBreak', is: 'hr' } as EngineVNode

    case 'Html': {
      const value = typeof node.props?.value === 'string' ? node.props.value : ''
      return { type: 'html', is: 'div', props: { innerHTML: value } } as EngineVNode
    }

    case 'Math': {
      const formula = typeof node.props?.formula === 'string' ? node.props.formula : ''
      const display = node.props?.display !== false
      return {
        type: 'math',
        is: 'KatexElement',
        props: { formula, display: true }
      } as EngineVNode
    }

    case 'InlineMath': {
      const formula = typeof node.props?.formula === 'string' ? node.props.formula : ''
      return {
        type: 'inlineMath',
        is: 'KatexElement',
        props: { formula, display: false }
      } as EngineVNode
    }

    case 'Table':
      return { type: 'table', is: 'table', children: adaptChildren(node.children) } as EngineVNode

    case 'TableRow':
      return { type: 'tableRow', is: 'tr', children: adaptChildren(node.children) } as EngineVNode

    case 'TableCell':
      return { type: 'tableCell', is: 'td', children: adaptChildren(node.children) } as EngineVNode

    default: {
      const v = node.props?.value
      return v != null
        ? { type: String(node.type || 'text'), is: '#text', props: { nodeValue: String(v) } } as EngineVNode
        : null
    }
  }
}

function adaptChildren(children?: RenderNode[] | string): EngineVNode[] | string {
  if (typeof children === 'string') return ''
  if (!children || children.length === 0) return ''
  return children.map(child => adaptNode(child)).filter(Boolean) as EngineVNode[]
}

export default { renderTreeToVNode }
