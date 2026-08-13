<template>
  <section class="section">
    <h2 class="title">{{ block.title }}</h2>
    <ContentRenderer :blocks="block.blocks" />
  </section>
</template>

<script setup lang="ts">
/**
 * SectionBlock 组件 - 分区
 *
 * 唯一可嵌套的 Block 类型。渲染标题后递归渲染子 Block 列表。
 * 通过 ContentBlocksRenderer（即 Renderer.vue）实现递归渲染。
 */
import type { SectionBlock } from '~/learning/lesson-ast'

defineProps<{ block: SectionBlock }>()
</script>

<style scoped>
.section {
  margin: var(--spacing-lg) 0;
}
.title {
  font-size: var(--text-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border);
}
</style>
