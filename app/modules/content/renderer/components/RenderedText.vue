<template>
  <div v-if="!nodes || nodes.length === 0" class="ce-node-empty">
    <slot name="empty" />
    <span v-if="typeof fallbackText === 'string'">{{ fallbackText }}</span>
  </div>
  <div v-else class="ce-node-root">
    <RenderedNode
      v-for="(n, i) in nodes"
      :key="i"
      :node="n"
      :depth="0"
    />
  </div>
</template>

<script setup>
import RenderedNode from './RenderedNode.vue'

const props = defineProps({
  ast: { type: Object, default: null },
  nodes: { type: Array, default: () => [] },
  fallbackText: {
    type: String,
    default: p => (typeof p?.ast?.content === 'string' ? p.ast.content : '')
  }
})
</script>
