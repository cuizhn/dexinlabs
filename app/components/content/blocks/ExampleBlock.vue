<template>
  <div class="example">
    <div v-if="block.title" class="title">{{ block.title }}</div>
    <div class="body" v-html="block.content" />
  </div>
</template>

<script setup lang="ts">
/**
 * ExampleBlock 组件 - 示例
 *
 * 展示解题过程、应用场景等教学内容。
 */
import type { ExampleBlock } from '~/learning/lesson-ast'

defineProps<{ block: ExampleBlock }>()
</script>

<style scoped>
.example {
  margin: var(--spacing-md) 0;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  border-left: 4px solid var(--color-success);
}

.title {
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-primary);
}
</style>
