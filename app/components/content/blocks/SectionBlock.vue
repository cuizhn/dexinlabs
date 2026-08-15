<template>
  <section class="section">
    <h2 class="title">
      <ContentInlineRenderer :nodes="block.title" />
    </h2>
    <ContentRenderer :blocks="block.blocks" />
  </section>
</template>

<script setup lang="ts">
/**
 * SectionBlock 组件 - 分区
 *
 * 唯一可嵌套的 Block 类型。渲染标题后递归渲染子 Block 列表。
 * title 为 Inline[] 语义结构，由 InlineRenderer 统一渲染。
 * 通过 ContentRenderer（即 Renderer.vue）实现递归渲染。
 */
import type { SectionBlock } from '@shared/lessonAST'

defineProps<{ block: SectionBlock }>()
</script>

<style scoped>
/* 章节标题：教材式分节，标题下细线 + 更大呼吸 */
.section {
  margin: 2.75rem 0 1.5rem;
}
.title {
  font-size: 1.35em;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-heading);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border);
}
</style>
