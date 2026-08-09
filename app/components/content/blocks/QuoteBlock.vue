<template>
  <blockquote class="block-quote" v-html="block.content" />
</template>

<script setup lang="ts">
/**
 * QuoteBlock 组件 - 引用
 */
import type { QuoteBlock } from '~/learning/lesson-ast'

defineProps<{ block: QuoteBlock }>()
</script>

<style scoped>
.block-quote {
  border-left: 3px solid var(--color-primary, #4a90d9);
  margin: 1em 0;
  padding: 0.5em 1em;
  color: var(--color-text-secondary, #666);
  background: var(--color-bg-secondary, #f8f9fa);
  border-radius: 0 4px 4px 0;
}
</style>
