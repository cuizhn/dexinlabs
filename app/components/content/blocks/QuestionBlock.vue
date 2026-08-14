<template>
  <div class="question">
    <div class="prompt">
      <ContentRenderer :blocks="block.prompt" />
    </div>

    <details v-if="block.hint" class="section">
      <summary>💡 提示</summary>
      <div>{{ block.hint }}</div>
    </details>
  </div>
</template>

<script setup lang="ts">
/**
 * QuestionBlock 组件 - 练习题 / 思考题
 *
 * prompt 为 Block[]，通过 ContentRenderer 递归渲染。
 * hint 为字符串（可选），通过 <details> 渐进展示。
 */
import type { QuestionBlock } from '@shared/lesson-ast'

defineProps<{ block: QuestionBlock }>()
</script>

<style scoped>
.question {
  margin: var(--spacing-md) 0;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  border-left: 4px solid var(--color-secondary);
}

.prompt {
  margin-bottom: var(--spacing-sm);
}

.section {
  margin: var(--spacing-xs) 0;
  padding: var(--spacing-xs);
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius-sm);
}

.section summary {
  cursor: pointer;
  font-weight: 600;
  font-size: var(--text-sm);
  user-select: none;
}

.section > div {
  margin-top: var(--spacing-xs);
}
</style>
