<template>
  <article class="lesson">
    <section class="lesson__body">
      <p v-if="eyebrow" class="lesson__eyebrow">{{ eyebrow }}</p>
      <h1 class="lesson__title">
        {{ lessonData?.title }}
      </h1>

      <div class="content">
        <ContentRenderer
          v-if="lessonData?.content?.blocks?.length"
          :blocks="lessonData.content.blocks"
        />
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
/**
 * Lesson 页面 - 沉浸式课时学习
 *
 * 路由：/courses/:topicSlug/:chapterSlug/:lessonSlug
 *
 * 视觉独立设计：现代电子书 × 纸质教材 × 数字学习工具。
 * - 暖米白纸张背景（非纯白，非明显黄色）；
 * - 较窄阅读宽度 + 衬线字体，长时间阅读舒适；
 * - 结构线像书籍排版中的章节分隔，而非网页卡片边框；
 * - 内容像书，交互像工具（思考题/提示保留数字 UI）。
 *
 * 实现方式：在 .lesson 作用域内覆盖 CSS 变量（暖色纸体系 + 衬线），
 * 嵌套的 ContentRenderer 及各 Block 组件自动继承新变量值，
 * 不修改 AST / Renderer 架构 / 数据库。
 */
import { useRouteParam } from '~/composables/useRouteParam'

definePageMeta({
  layout: 'default'
})

const topicSlug = useRouteParam('topicSlug') ?? ''
const chapterSlug = useRouteParam('chapterSlug') ?? ''
const lessonSlug = (useRouteParam('lessonSlug') ?? '') as string

const { lesson, topic, chapter } = await useLessonPage(topicSlug, chapterSlug, lessonSlug)

const lessonData = computed(() => lesson.value)

/** 教材式眉标：主题 · 章节，给阅读建立上下文 */
const eyebrow = computed(() => {
  const parts = [topic.value?.title, chapter.value?.title].filter(Boolean)
  return parts.length ? parts.join(' · ') : ''
})

useHead({
  title: computed(() => lessonData.value?.title || '学习课时')
})
</script>

<style scoped>
/* ── 纸张 tokens：仅在 Lesson 作用域内覆盖全局中性体系 ── */
.lesson {
  /* 暖米白背景：非纯白、非明显黄色，降低纯白视觉刺激 */
  --paper-bg: #fbf8f2;
  --paper-ink: #2a2620;
  --paper-ink-secondary: #5c554b;
  --paper-ink-muted: #9a9183;
  --paper-border: #e7e0d2;
  --paper-border-strong: #d8cfbb;

  /* 覆盖全局变量，让嵌套的 Block 组件自动继承暖色体系 */
  --color-bg-primary: var(--paper-bg);
  --color-bg-secondary: #f5f1e7;
  --color-bg-white: var(--paper-bg);
  --color-text-primary: var(--paper-ink);
  --color-text: var(--paper-ink-secondary);
  --color-text-secondary: var(--paper-ink-secondary);
  --color-text-light: var(--paper-ink-muted);
  --color-text-muted: var(--paper-ink-muted);
  --color-heading: var(--paper-ink);
  --color-border: var(--paper-border);
  --color-border-light: #efe9dc;
  --color-border-strong: var(--paper-border-strong);

  /* Lesson 使用衬线字体（教材感）；首页/普通页不受影响 */
  --font-content: 'Noto Serif SC', Georgia, 'Times New Roman', 'Songti SC', serif;

  flex-grow: 1;
  user-select: text;
  background: var(--paper-bg);
  color: var(--paper-ink);
  font-family: var(--font-content);
}

/**
 * ── 深色下的"暖色暗纸" ──
 *
 * 只需重新定义 --paper-* 与两处硬编码色值，
 * 上面 .lesson 中 --color-* → var(--paper-*) 的映射会自动取到新值，
 * 因此嵌套的 Renderer / Block 组件无需任何改动。
 *
 * 取值思路：不用中性灰，保留暖色偏移（墨黑略偏棕、文字暖白），
 * 让 Lesson 在深色下依然是"纸"，而不是变成普通深色页面。
 */
:root[data-theme='dark'] .lesson {
  --paper-bg: #1c1a17;
  --paper-ink: #e9e3d7;
  --paper-ink-secondary: #c4bcac;
  --paper-ink-muted: #8d8474;
  --paper-border: #332f28;
  --paper-border-strong: #464137;

  --color-bg-secondary: #262320;
  --color-border-light: #2b2823;
}

.lesson__body {
  max-width: 46rem; /* 约 736px：较窄阅读宽度，长时间阅读舒适 */
  margin: 0 auto;
  padding: clamp(2.5rem, 6vw, 4rem) var(--spacing-lg) clamp(4rem, 9vw, 7rem);
}

.lesson__eyebrow {
  margin: 0 0 var(--spacing-md);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.14em;
  color: var(--paper-ink-muted);
}

.lesson__title {
  margin: 0 0 clamp(2rem, 5vw, 3rem);
  font-size: clamp(1.875rem, 4.5vw, 2.5rem);
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 1.25;
  color: var(--paper-ink);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--paper-border);
}

/* ── 教材正文排版 ── */
.content {
  font-size: 1.0625rem;
  line-height: 1.9;
  color: var(--paper-ink-secondary);
}

.content :deep(p) {
  margin: 1.4rem 0;
}

.content :deep(h2),
.content :deep(h3),
.content :deep(h4) {
  color: var(--paper-ink);
  line-height: 1.35;
  scroll-margin-top: 80px;
}

.content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 2.75rem 0 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--paper-border);
}

.content :deep(h3) {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 2rem 0 0.875rem;
}

.content :deep(h4) {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 1.5rem 0 0.5rem;
}

.content :deep(li) {
  line-height: 1.85;
}

.content :deep(li + li) {
  margin-top: 0.4rem;
}

.content :deep(code) {
  color: var(--paper-ink);
}

.content :deep(a) {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.content :deep(strong) {
  color: var(--paper-ink);
  font-weight: 600;
}

/* 行内/块级公式随暖色继承 */
.content :deep(.katex) {
  color: var(--paper-ink);
}

@media (max-width: 768px) {
  .lesson__body {
    padding: clamp(2rem, 6vw, 3rem) var(--spacing-md) clamp(3rem, 8vw, 5rem);
  }

  .lesson__title {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }

  .content {
    font-size: 1rem;
    line-height: 1.85;
  }
}
</style>
