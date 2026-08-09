<template>
  <div class="block-example">
    <div v-if="block.title" class="block-example__title">{{ block.title }}</div>
    <div class="block-example__body" v-html="block.content" />
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
.block-example {
  margin: 1em 0;
  padding: 0.75em 1em;
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 6px;
  border-left: 4px solid #27ae60;
}
.block-example__title {
  font-weight: 600;
  margin-bottom: 0.5em;
  color: var(--color-text-primary, #333);
}
</style>
