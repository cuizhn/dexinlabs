/**
 * HTML Renderer Adapter — Render Tree → HTML（IMPLEMENTATION Decision 4）。
 *
 * Decision 4 强制：Adapter 只接受 Render Tree，不感知 Internal AST / Parser 专有数据结构。
 * 本模块是 Render Tree 到 HTML string 的转换器，职责单一：
 *   RenderNode(type, props, children) → HTML 字符串拼接
 *
 * 禁止：
 *   - 本模块 import Internal AST 类型 / marked Token
 *   - 本模块重新解析 Markdown（任何形式的 md.parse / marked.parse）
 *   - 本模块做业务逻辑（heading id 生成 / 链接改写等已在 Transformer+Compiler 处理）
 */
import type { RenderNode, RenderRoot, RenderTree, RendererAdapterContext } from '../types/render-tree'
import { slugifyHeading } from '../transformer/heading'
import { renderFormulaToKatexHtml } from '../utils/katex'

export function renderTreeToHTML(
  tree: RenderTree,
  _context: RendererAdapterContext = {}
): string {
  const root = Array.isArray(tree) ? tree : tree.children
  return root.map(n => renderNode(n)).join('\n')
}

function renderNode(node: RenderNode | string): string {
  if (typeof node === 'string') return escapeHtml(node)
  if (!node || !node.type) return ''

  switch (node.type) {
    case 'Root': {
      const children = (node as RenderRoot).children
      const cls = Array.isArray((node as RenderRoot).props?.class)
        ? ` class="${(node as RenderRoot).props?.class?.join(' ')}"`
        : ''
      return `<div${cls} data-md-root="true">${children.map(c => renderNode(c)).join('')}</div>`
    }

    case 'Heading': {
      const level = Number(node.props?.level || 1)
      const id = typeof node.props?.id === 'string' ? node.props.id : (() => {
        const text = getTextFromChildren(node.children)
        return text ? slugifyHeading(text) : undefined
      })()
      const idAttr = id ? ` id="${id}"` : ''
      return `<h${level}${idAttr}>${renderChildren(node.children)}</h${level}>\n`
    }

    case 'Paragraph':
      return `<p>${renderChildren(node.children)}</p>\n`

    case 'Text': {
      const value = typeof node.props?.value === 'string' ? node.props.value : ''
      return escapeHtml(value)
    }

    case 'Strong':
      return `<strong>${renderChildren(node.children)}</strong>`

    case 'Emphasis':
      return `<em>${renderChildren(node.children)}</em>`

    case 'Delete':
      return `<del>${renderChildren(node.children)}</del>`

    case 'Link': {
      const href = escapeAttr(String(node.props?.href || ''))
      const target = typeof node.props?.target === 'string' ? ` target="${escapeAttr(node.props.target)}"` : ''
      const rel = typeof node.props?.rel === 'string' ? ` rel="${escapeAttr(node.props.rel)}"` : ''
      const title = typeof node.props?.title === 'string' ? ` title="${escapeAttr(node.props.title)}"` : ''
      return `<a href="${href}"${target}${rel}${title}>${renderChildren(node.children)}</a>`
    }

    case 'Image': {
      const src = escapeAttr(String(node.props?.src || ''))
      const alt = escapeAttr(String(node.props?.alt || ''))
      return `<img src="${src}" alt="${alt}"/>`
    }

    case 'Code': {
      const lang = typeof node.props?.lang === 'string' ? node.props.lang : ''
      const value = typeof node.props?.value === 'string' ? node.props.value : ''
      const langAttr = lang ? ` data-lang="${escapeAttr(lang)}"` : ''
      return `<pre${langAttr}><code${langAttr}>${escapeHtml(value)}</code></pre>\n`
    }

    case 'InlineCode': {
      const value = typeof node.props?.value === 'string' ? node.props.value : ''
      return `<code>${escapeHtml(value)}</code>`
    }

    case 'List': {
      const tag = node.props?.ordered ? 'ol' : 'ul'
      return `<${tag}>\n${renderChildren(node.children)}\n</${tag}>\n`
    }

    case 'ListItem':
      return `<li>${renderChildren(node.children)}</li>`

    case 'Blockquote':
      return `<blockquote>\n${renderChildren(node.children)}\n</blockquote>\n`

    case 'ThematicBreak':
      return `<hr/>\n`

    case 'Html': {
      const value = typeof node.props?.value === 'string' ? node.props.value : ''
      return value
    }

    case 'Math':
    case 'InlineMath': {
      const formula = typeof node.props?.formula === 'string' ? node.props.formula : ''
      const displayMode = node.type === 'Math' && node.props?.display !== false
      return renderFormulaToKatexHtml(formula, displayMode)
    }

    case 'Table':
      return `<table>${renderChildren(node.children)}</table>\n`

    case 'TableRow':
      return `<tr>${renderChildren(node.children)}</tr>`

    case 'TableCell': {
      const align = typeof node.props?.align === 'string' ? node.props.align : null
      const style = align ? ` style="text-align:${escapeAttr(align)}"` : ''
      return `<td${style}>${renderChildren(node.children)}</td>`
    }

    default:
      return ''
  }
}

function renderChildren(children?: RenderNode[] | string): string {
  if (typeof children === 'string') return escapeHtml(children)
  if (!children || children.length === 0) return ''
  return children.map(c => renderNode(c)).join('')
}

function getTextFromChildren(children?: RenderNode[] | string): string {
  if (typeof children === 'string') return children
  if (!children || children.length === 0) return ''
  return children.map(c => {
    if (typeof c === 'string') return c
    if (c.type === 'Text') return String(c.props?.value || '')
    return getTextFromChildren(c.children)
  }).join('')
}

function escapeHtml(s: string = ''): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(s: string = ''): string {
  return escapeHtml(s)
}

export default { renderTreeToHTML }
