<template>
  <div class="block-question">
    <div class="block-question__prompt" v-html="promptHtml" />

    <details v-if="block.hint" class="block-question__section">
      <summary>💡 提示</summary>
      <div v-html="hintHtml" />
    </details>

    <details v-if="block.answer" class="block-question__section">
      <summary>✅ 答案</summary>
      <div v-html="answerHtml" />
    </details>

    <details v-if="block.analysis" class="block-question__section">
      <summary>📖 解析</summary>
      <div v-html="analysisHtml" />
    </details>
  </div>
</template>

<script setup lang="ts">
/**
 * QuestionBlock 组件 - 练习题 / 思考题
 *
 * 题目始终展示，提示/答案/解析通过 <details> 渐进展示。
 */
import { renderInline } from '@markdown'
import type { QuestionBlock } from '@content/types/ast'

const props = defineProps<{ block: QuestionBlock }>()

const promptHtml = computed(() => renderInline(props.block.prompt))
const hintHtml = computed(() => renderInline(props.block.hint || ''))
const answerHtml = computed(() => renderInline(props.block.answer || ''))
const analysisHtml = computed(() => renderInline(props.block.analysis || ''))
</script>

<style scoped>
.block-question {
  margin: 1em 0;
  padding: 0.75em 1em;
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 6px;
  border-left: 4px solid #8e44ad;
}
.block-question__prompt {
  margin-bottom: 0.75em;
}
.block-question__section {
  margin: 0.5em 0;
  padding: 0.5em;
  background: var(--color-bg-secondary, #f8f9fa);
  border-radius: 4px;
}
.block-question__section summary {
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9375rem;
  user-select: none;
}
.block-question__section > div {
  margin-top: 0.5em;
}
</style>
