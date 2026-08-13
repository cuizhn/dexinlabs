<template>
  <blockquote class="quote" v-html="block.content" />
</template>

<script setup lang="ts">
/**
 * QuoteBlock 组件 - 引用
 */
import type { QuoteBlock } from '~/learning/lesson-ast'

defineProps<{ block: QuoteBlock }>()
</script>

<style scoped>
.quote {
  border-left: 3px solid var(--color-primary);
  margin: var(--spacing-md) 0;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
}
</style>
