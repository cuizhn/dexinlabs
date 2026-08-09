<template>
  <section class="block-section">
    <h2 class="block-section__title">{{ block.title }}</h2>
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
.block-section {
  margin: 1.5em 0;
}
.block-section__title {
  font-size: 1.375rem;
  font-weight: 700;
  margin-bottom: 0.75em;
  padding-bottom: 0.25em;
  border-bottom: 1px solid var(--color-border, #eee);
}
</style>
