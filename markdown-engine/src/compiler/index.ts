/**
 * Compiler — Internal AST → Render Tree 编译模块（IMPLEMENTATION Decision 1 + 4）。
 *
 * Decision 1 强制：禁止 Renderer 直接遍历 Internal AST。
 * 本模块是 Internal AST（Transformer 输出）到 Render Tree（跨平台渲染协议）的唯一桥梁。
 * Renderer Adapter（HTML / Vue / JSON）只能消费 Render Tree，禁止感知 Internal AST 的任何字段。
 *
 * 编译输出：
 *   RenderNode（type: PascalCase 抽象枚举 + props/children，平台无关）
 *   例：{ type: 'Heading', props: { level: 2, id: '一元二次方程' }, children: [ { type: 'Text', props: { value: '一元二次方程' } } ] }
 *
 * 各 Renderer Adapter 负责把 RenderTree 映射到平台产物（HTML/VNode/JSON）。
 */
import type {
  TransformedAstNode,
  TransformedRootAstNode
} from '../ast/types'
import type { RenderNode, RenderRoot, RenderTree } from '../types/render-tree'
import type { TransformedInternalAstNode, TransformedInternalRootAstNode } from '../types/internal-ast'

export function compileToRenderTree(
  root: TransformedInternalRootAstNode | TransformedRootAstNode,
  context: { theme?: string } = {}
): RenderRoot {
  const children = (root.children || [])
    .map(child => compileNode(child as TransformedInternalAstNode))
    .filter(Boolean) as RenderNode[]
  return {
    type: 'Root',
    props: {
      theme: context.theme || 'default',
      class: ['ce-markdown', `ce-theme-${context.theme || 'default'}`],
      'data-md-root': true
    },
    children
  }
}

function compileNode(node: TransformedAstNode | TransformedInternalAstNode): RenderNode | null {
  if (!node || typeof node !== 'object') return null

  switch (node.type) {
    case 'heading': {
      const raw = node as Record<string, unknown>
      return {
        type: 'Heading',
        props: {
          level: Number(raw.depth || 1),
          id: typeof raw.id === 'string' ? raw.id : undefined
        },
        children: compileChildren(node.children)
      }
    }

    case 'paragraph':
      return {
        type: 'Paragraph',
        children: compileChildren(node.children)
      }

    case 'text': {
      const value = typeof node.value === 'string' ? node.value : ''
      return {
        type: 'Text',
        props: { value }
      }
    }

    case 'strong':
      return { type: 'Strong', children: compileChildren(node.children) }

    case 'emphasis':
      return { type: 'Emphasis', children: compileChildren(node.children) }

    case 'delete':
      return { type: 'Delete', children: compileChildren(node.children) }

    case 'link': {
      const raw = node as Record<string, unknown>
      return {
        type: 'Link',
        props: {
          href: String(raw.href || ''),
          target: typeof raw.target === 'string' ? raw.target : undefined,
          rel: typeof raw.rel === 'string' ? raw.rel : undefined,
          title: typeof raw.title === 'string' ? raw.title : undefined
        },
        children: compileChildren(node.children)
      }
    }

    case 'image': {
      const raw = node as Record<string, unknown>
      return {
        type: 'Image',
        props: {
          src: String(raw.url || raw.href || ''),
          alt: String(raw.value || raw.alt || '')
        }
      }
    }

    case 'code': {
      const raw = node as Record<string, unknown>
      const lang = String(raw.lang || '')
      const value = typeof raw.value === 'string' ? raw.value : ''
      return {
        type: 'Code',
        props: { lang, value }
      }
    }

    case 'inlineCode': {
      const value = typeof node.value === 'string' ? node.value : ''
      return {
        type: 'InlineCode',
        props: { value }
      }
    }

    case 'list': {
      const raw = node as Record<string, unknown>
      return {
        type: 'List',
        props: { ordered: !!raw.ordered },
        children: compileChildren(node.children)
      }
    }

    case 'listItem':
      return { type: 'ListItem', children: compileChildren(node.children) }

    case 'blockquote':
      return { type: 'Blockquote', children: compileChildren(node.children) }

    case 'thematicBreak':
      return { type: 'ThematicBreak' }

    case 'html': {
      const value = typeof node.value === 'string' ? node.value : ''
      return {
        type: 'Html',
        props: { value }
      }
    }

    case 'math': {
      const display = (node as Record<string, unknown>).display !== false
      return {
        type: 'Math',
        props: {
          formula: typeof node.value === 'string' ? node.value : '',
          display
        }
      }
    }

    case 'inlineMath':
      return {
        type: 'InlineMath',
        props: {
          formula: typeof node.value === 'string' ? node.value : '',
          display: false
        }
      }

    case 'table':
      return { type: 'Table', children: compileChildren(node.children) }

    case 'tableRow':
      return { type: 'TableRow', children: compileChildren(node.children) }

    case 'tableCell': {
      const raw = node as Record<string, unknown>
      return {
        type: 'TableCell',
        props: { align: raw.align as string | null | undefined },
        children: compileChildren(node.children)
      }
    }

    default:
      return node.value != null
        ? { type: 'Text', props: { value: String(node.value) } }
        : null
  }
}

function compileChildren(children?: TransformedAstNode[] | TransformedInternalAstNode[]): RenderNode[] | string {
  if (!children || children.length === 0) return ''
  return children
    .map(child => compileNode(child))
    .filter(Boolean) as RenderNode[]
}

export type { RenderTree, RenderNode, RenderRoot }

export default { compileToRenderTree }
