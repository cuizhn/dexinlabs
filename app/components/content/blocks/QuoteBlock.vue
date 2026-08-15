<template>
  <blockquote class="quote">
    <ContentRenderer :blocks="block.children" />
  </blockquote>
</template>

<script setup lang="ts">
/**
 * QuoteBlock 组件 - 引用
 *
 * children 为 Block[]，通过 ContentRenderer 递归渲染。
 */
import type { QuoteBlock } from '@shared/lessonAST'

defineProps<{ block: QuoteBlock }>()
</script>

<style scoped>
/* 书籍式引用：无底色，仅靠左侧细线与缩进成立 */
.quote {
  margin: 2rem 0;
  padding: 0.25rem 0 0.25rem 1.5rem;
  border-left: 2px solid var(--color-border-strong);
  color: var(--color-text-secondary);
  background: none;
  border-radius: 0;
}
</style>
