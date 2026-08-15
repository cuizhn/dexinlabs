<template>
  <div class="preview">
    <div class="preview__surface">
      <p class="preview__eyebrow">正在探索</p>
      <h3 class="preview__title">{{ title }}</h3>
      <div class="content lesson-content">
        <ContentRenderer :blocks="blocks" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * LessonPreview - 首页"真实学习界面"视觉主体
 *
 * 直接消费现有 Lesson AST（Block[]），通过现有 ContentRenderer 渲染，
 * 不重新发明内容格式。包裹 .content 以复用全局 typography 排版。
 *
 * 这是首页实验场，不修改 Renderer / Lesson AST / LessonService。
 */
import type { Block } from '@shared/lessonAST'

defineProps<{
  title: string
  blocks: Block[]
}>()
</script>

<style scoped>
.preview {
  width: 100%;
}

.preview__surface {
  max-width: 720px;
  margin: 0 auto;
  background: var(--home-surface, #ffffff);
  border: 1px solid var(--home-border, #e4e4e7);
  border-radius: 8px;
  padding: clamp(1.5rem, 3.5vw, 2.5rem);
  overflow-x: auto;
}

.preview__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.75rem;
  font-size: var(--home-caption, 0.8125rem);
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--home-secondary, #52525b);
}

.preview__eyebrow::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--home-accent, #3b6fe0);
}

.preview__title {
  margin: 0 0 1.25rem;
  font-size: var(--home-h2, 1.5rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--home-fg, #18181b);
}

/* 让真实 Lesson 内容在首页近黑白体系下保持克制 */
.lesson-content {
  font-size: var(--home-body, 1.0625rem);
  line-height: 1.8;
  color: var(--home-fg, #18181b);
}

.lesson-content :deep(h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.75rem 0 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--home-border, #e4e4e7);
}

.lesson-content :deep(h3) {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 1.5rem 0 0.5rem;
}

.lesson-content :deep(p) {
  margin: 1rem 0;
}

.lesson-content :deep(table) {
  font-size: var(--home-sm, 0.9375rem);
}

.lesson-content :deep(li) {
  line-height: 1.75;
}
</style>
