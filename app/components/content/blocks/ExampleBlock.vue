<template>
  <div class="example">
    <div v-if="block.title" class="title">{{ block.title }}</div>
    <div class="body">
      <ContentRenderer :blocks="block.children" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ExampleBlock 组件 - 示例
 *
 * 展示解题过程、应用场景等教学内容。
 * children 为 Block[]，通过 ContentRenderer 递归渲染。
 */
import type { ExampleBlock } from '@shared/lessonAST'

defineProps<{ block: ExampleBlock }>()
</script>

<style scoped>
/* 教材式示例：细左侧结构线 + 标签，无底色无边框卡片 */
.example {
  margin: 2rem 0;
  padding: 0.25rem 0 0.25rem 1.25rem;
  border-left: 2px solid var(--color-border-strong);
}

.example::before {
  content: '例';
  display: block;
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.12em;
  color: var(--color-text-muted);
  margin-bottom: 0.375rem;
}

.title {
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--color-heading);
}
</style>
