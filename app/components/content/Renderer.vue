<template>
  <div :class="wrapperClass" data-ce-markdown-renderer>
    <slot name="header" :toc="toc" :frontmatter="frontmatter" />

    <div :class="innerClass" class="ce-content-body">
      <slot name="body-start" />
      <div v-if="html" class="ce-markdown" v-html="html" />
      <slot name="body-end" />
      <slot name="empty" v-if="!html" />
    </div>

    <slot name="footer" :toc="toc" :frontmatter="frontmatter" :readingTime="readingTime" />
  </div>
</template>

<script setup lang="ts">
/**
 * ContentRenderer - 纯展示型 Markdown 渲染器
 *
 * 只负责接收已渲染的 HTML 并展示，不处理 Markdown 解析、异步状态或内容适配。
 * Markdown → HTML 的转换由 Service 层调用 @markdown 完成，页面层将结果传给本组件。
 *
 * 职责边界：
 * - ✅ 展示 HTML
 * - ✅ 提供 header / body-start / body-end / footer / empty 插槽
 * - ✅ 提供 theme CSS class
 * - ❌ 不 import @markdown
 * - ❌ 不处理 Markdown 字符串
 * - ❌ 不管理异步状态
 */

interface TocItem {
  level: number
  text: string
  id: string
}

const props = withDefaults(defineProps<{
  /** 已渲染的 HTML 字符串 */
  html?: string
  /** 目录（未来扩展） */
  toc?: TocItem[]
  /** 文档元数据（未来扩展） */
  frontmatter?: Record<string, unknown>
  /** 预计阅读时间（未来扩展） */
  readingTime?: number | null
  /** 主题名称，映射到 ce-theme-{name} CSS 类 */
  theme?: string
}>(), {
  html: '',
  toc: () => [],
  frontmatter: () => ({}),
  readingTime: null,
  theme: 'default'
})

const wrapperClass = computed(() => [
  'ce-markdown-renderer',
  `ce-theme-${props.theme}`
])

/** 内容区域 CSS 类（静态值，无需响应式计算） */
const innerClass = ['ce-content', 'prose', 'prose-neutral', 'dark:prose-invert', 'max-w-none']
</script>

<style scoped>
.ce-markdown-renderer {
  --ce-heading-anchor-color: var(--ce-accent, #3b82f6);
}

.ce-theme-default {
  color: inherit;
}

.ce-content {
  line-height: 1.75;
}

/* ── Markdown 内容样式 ── */
.ce-markdown :deep(h1),
.ce-markdown :deep(h2),
.ce-markdown :deep(h3),
.ce-markdown :deep(h4) {
  scroll-margin-top: 1rem;
}

.ce-markdown :deep(pre) {
  overflow-x: auto;
}

.ce-markdown {
  font-family: var(--font-content);
  line-height: 1.75;
  font-size: var(--text-base);
  color: var(--color-text);
}

.ce-markdown :deep(h1) {
  font-size: var(--text-4xl);
  font-weight: 800;
  margin: var(--spacing-2xl) 0 var(--spacing-lg);
  color: var(--color-heading);
}

.ce-markdown :deep(h2) {
  font-size: var(--text-3xl);
  font-weight: 700;
  margin: var(--spacing-xl) 0 var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-border-light);
  color: var(--color-heading);
}

.ce-markdown :deep(h3) {
  font-size: var(--text-xl);
  font-weight: 600;
  margin: var(--spacing-lg) 0 var(--spacing-sm);
  color: var(--color-heading);
}

.ce-markdown :deep(h4) {
  font-size: var(--text-lg);
  font-weight: 600;
  margin: var(--spacing-md) 0 var(--spacing-sm);
}

.ce-markdown :deep(p) {
  margin: var(--spacing-md) 0;
}

.ce-markdown :deep(ul),
.ce-markdown :deep(ol) {
  margin: var(--spacing-md) 0;
  padding-left: var(--spacing-xl);
}

.ce-markdown :deep(ul) {
  list-style: disc;
}

.ce-markdown :deep(ol) {
  list-style: decimal;
}

.ce-markdown :deep(li) {
  margin: var(--spacing-xs) 0;
  line-height: 1.8;
}

.ce-markdown :deep(blockquote) {
  margin: var(--spacing-lg) 0;
  padding: var(--spacing-md) var(--spacing-lg);
  border-left: 4px solid var(--color-primary);
  background-color: var(--color-primary-light);
  border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
  color: var(--color-text-secondary);
}

.ce-markdown :deep(blockquote p) {
  margin: 0;
}

.ce-markdown :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.875em;
  padding: 2px 6px;
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-sm);
  color: var(--color-primary-dark);
}

.ce-markdown :deep(pre) {
  margin: var(--spacing-lg) 0;
  padding: var(--spacing-lg);
  background-color: #1E293B;
  border-radius: var(--border-radius-lg);
  overflow-x: auto;
}

.ce-markdown :deep(pre code) {
  padding: 0;
  background: none;
  color: #E2E8F0;
  font-size: var(--text-sm);
  line-height: 1.7;
}

.ce-markdown :deep(table) {
  margin: var(--spacing-lg) 0;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.ce-markdown :deep(th) {
  background-color: var(--color-bg-secondary);
  font-weight: 600;
  text-align: left;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 2px solid var(--color-border);
}

.ce-markdown :deep(td) {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
}

.ce-markdown :deep(tr:last-child td) {
  border-bottom: none;
}

.ce-markdown :deep(hr) {
  margin: var(--spacing-2xl) 0;
  border: none;
  border-top: 1px solid var(--color-border);
}

.ce-markdown :deep(img) {
  margin: var(--spacing-lg) 0;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
}

.ce-markdown :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.ce-markdown :deep(a:hover) {
  color: var(--color-primary-dark);
}

.ce-markdown :deep(strong) {
  font-weight: 700;
  color: var(--color-text-primary);
}

.ce-markdown :deep(em) {
  font-style: italic;
}

/* KaTeX 数学公式 */
.ce-markdown :deep(.katex-display) {
  margin: var(--spacing-lg) 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border-light);
}

.ce-markdown :deep(.katex) {
  font-size: 1.05em;
}

.ce-markdown :deep(.katex-inline) {
  display: inline;
}

.ce-markdown :deep(.katex-display::-webkit-scrollbar) {
  height: 4px;
}

.ce-markdown :deep(.katex-display::-webkit-scrollbar-track) {
  background: transparent;
}

.ce-markdown :deep(.katex-display::-webkit-scrollbar-thumb) {
  background-color: var(--color-text-muted);
  border-radius: 2px;
}
</style>
