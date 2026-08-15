<template>
  <div class="question">
    <div class="prompt">
      <ContentRenderer :blocks="block.prompt" />
    </div>

    <details v-if="block.hint" class="section">
      <summary>提示</summary>
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
import type { QuestionBlock } from '@shared/lessonAST'

defineProps<{ block: QuestionBlock }>()
</script>

<style scoped>
/* 思考题：教材式上结构线 + 小标签；提示展开保留数字工具的交互感 */
.question {
  margin: 2.25rem 0;
  padding: 1.25rem 0 0;
  border-top: 2px solid var(--color-border-strong);
}

.question::before {
  content: '思考';
  display: block;
  margin-bottom: 0.75rem;
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.12em;
  color: var(--color-text-muted);
}

.prompt {
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
}

.section {
  margin: var(--spacing-sm) 0 0;
}

.section summary {
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-primary);
  user-select: none;
}

.section summary:hover {
  color: var(--color-primary-hover);
}

.section > div {
  margin-top: var(--spacing-xs);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.7;
}
</style>
