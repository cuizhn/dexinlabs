<template>
  <component :is="tag" v-if="text">
    <slot />{{ text }}
  </component>
  <component :is="tag" v-else-if="typeof node?.value === 'string'">
    <slot />{{ node.value }}
  </component>
  <component :is="tag" v-else-if="Array.isArray(node?.children) && node.children.length">
    <slot />
    <RenderedNodeRecursive
      v-for="(c, i) in node.children"
      :key="i"
      :node="c"
      :depth="depth + 1"
    />
  </component>
  <component :is="tag" v-else>
    <slot />
  </component>
</template>

<script>
import { computed, defineComponent, h } from 'vue'

export default defineComponent({
  name: 'RenderedNode',

  props: {
    node: { type: [Object, Array, String], default: () => ({}) },
    depth: { type: Number, default: 0 }
  },

  setup(props) {
    const text = computed(() => {
      if (typeof props.node === 'string') return props.node
      if (typeof props.node?.value === 'string') return props.node.value
      if (typeof props.node?.content === 'string') return props.node.content
      return ''
    })

    const tag = computed(() => {
      const type = props.node?.type
      switch (type) {
        case 'heading':
          return `h${Math.min(6, Math.max(1, props.node?.depth || 1))}`
        case 'paragraph':
          return 'p'
        case 'link':
          return 'a'
        case 'list':
          return props.node?.ordered ? 'ol' : 'ul'
        case 'listItem':
          return 'li'
        case 'blockquote':
          return 'blockquote'
        case 'code':
          return 'code'
        case 'image':
          return 'img'
        default:
          return 'span'
      }
    })

    const RenderedNodeRecursive = {
      name: 'RenderedNodeRecursive',
      inheritAttrs: false,
      props: {
        node: { type: [Object, Array, String], default: () => ({}) },
        depth: { type: Number, default: 0 }
      },
      setup(rprops) {
        const rtext = computed(() => {
          if (typeof rprops.node === 'string') return rprops.node
          if (typeof rprops.node?.value === 'string') return rprops.node.value
          if (typeof rprops.node?.content === 'string') return rprops.node.content
          return ''
        })

        const rtag = computed(() => {
          const t = rprops.node?.type
          switch (t) {
            case 'heading': return `h${Math.min(6, Math.max(1, rprops.node?.depth || 1))}`
            case 'paragraph': return 'p'
            case 'link': return 'a'
            case 'list': return rprops.node?.ordered ? 'ol' : 'ul'
            case 'listItem': return 'li'
            case 'blockquote': return 'blockquote'
            case 'code': return 'code'
            case 'image': return 'img'
            default: return 'span'
          }
        })

        return () => {
          const children = []
          if (rtext.value) children.push(rtext.value)
          if (Array.isArray(rprops.node?.children) && rprops.node.children.length) {
            rprops.node.children.forEach((c, idx) => {
              children.push(h(RenderedNodeRecursive, { key: idx, node: c, depth: rprops.depth + 1 }))
            })
          }
          return h(rtag.value, {}, children)
        }
      }
    }

    return { text, tag, RenderedNodeRecursive }
  }
})
</script>
