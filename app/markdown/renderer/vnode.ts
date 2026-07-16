import type { Root as HastRoot, Element, Text, Comment, Doctype } from 'hast'

export interface VNode {
  type: string
  tag?: string
  props?: Record<string, unknown>
  children?: VNode[]
  text?: string
}

function hastToVNode(node: any): VNode | null {
  if (!node) return null

  if (node.type === 'text') {
    return {
      type: 'text',
      text: (node as Text).value
    }
  }

  if (node.type === 'comment') {
    return null
  }

  if (node.type === 'doctype') {
    return null
  }

  if (node.type === 'root' || node.type === 'element') {
    const element = node as Element
    const tagName = element.tagName || 'div'
    const props: Record<string, unknown> = {}

    if (element.properties) {
      for (const [key, value] of Object.entries(element.properties)) {
        if (key === 'className') {
          props.class = Array.isArray(value) ? value.join(' ') : value
        } else if (key === 'htmlFor') {
          props.for = value
        } else if (key === 'tabIndex') {
          props.tabindex = value
        } else {
          props[key] = value
        }
      }
    }

    const children: VNode[] = []
    if (element.children) {
      for (const child of element.children) {
        const vnode = hastToVNode(child)
        if (vnode) {
          children.push(vnode)
        }
      }
    }

    return {
      type: 'element',
      tag: tagName,
      props,
      children
    }
  }

  return null
}

export function hastToVNodes(hast: HastRoot): VNode[] {
  const result: VNode[] = []
  if (!hast.children) return result

  for (const child of hast.children) {
    const vnode = hastToVNode(child)
    if (vnode) {
      result.push(vnode)
    }
  }
  return result
}

export function renderToVNode(hast: HastRoot): VNode {
  const children = hastToVNodes(hast)
  return {
    type: 'root',
    children
  }
}
