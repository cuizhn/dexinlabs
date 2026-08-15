<script lang="ts">
/**
 * ContentInlineRenderer - Inline[] 语义节点的统一渲染器
 *
 * 消费 Lesson AST 的行内内容（Inline[]），输出对应 HTML：
 *   text      → 纯文本（自动转义）
 *   bold      → <strong>
 *   italic    → <em>
 *   code      → <code>
 *   link      → <a>
 *   math      → KaTeX 渲染（行内模式）
 *
 * 使用 render function 模式，递归处理 bold/italic/link 的 children。
 */
import { defineComponent, h, type PropType, type VNode } from 'vue'
import katex from 'katex'
import type { Inline, TextInline, BoldInline, ItalicInline, CodeInline, LinkInline, MathInline } from '@shared/lessonAST'

/** 将单个 Inline 节点渲染为 VNode */
function renderInline(node: Inline): VNode | string | null {
  switch (node.type) {
    case 'text':
      return renderText(node)
    case 'bold':
      return renderBold(node)
    case 'italic':
      return renderItalic(node)
    case 'code':
      return renderCode(node)
    case 'link':
      return renderLink(node)
    case 'math':
      return renderMath(node)
    default:
      return null
  }
}

function renderText(node: TextInline): string {
  return node.value
}

function renderBold(node: BoldInline): VNode {
  return h('strong', node.children.map(renderInline))
}

function renderItalic(node: ItalicInline): VNode {
  return h('em', node.children.map(renderInline))
}

function renderCode(node: CodeInline): VNode {
  return h('code', node.value)
}

function renderLink(node: LinkInline): VNode {
  return h(
    'a',
    { href: node.url, target: '_blank', rel: 'noopener noreferrer' },
    node.children.map(renderInline)
  )
}

function renderMath(node: MathInline): VNode {
  let html: string
  try {
    html = katex.renderToString(node.latex, {
      displayMode: false,
      throwOnError: false,
      strict: false
    })
  } catch {
    html = node.latex
  }
  return h('span', { class: 'inline-math', innerHTML: html })
}

export default defineComponent({
  name: 'ContentInlineRenderer',
  props: {
    /** 行内节点列表 */
    nodes: {
      type: Array as PropType<Inline[]>,
      required: true
    }
  },
  setup(props) {
    return () => h('span', props.nodes.map(renderInline))
  }
})
</script>

<style scoped>
.inline-math :deep(.katex) {
  font-size: 1.05em;
}
</style>
