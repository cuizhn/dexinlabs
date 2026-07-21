<template>
  <div :class="wrapperClass" data-ce-markdown-renderer>
    <slot name="header" :toc="toc" :frontmatter="frontmatter" />

    <div :class="innerClass" class="ce-content-body">
      <slot name="body-start" />
      <div v-if="renderedHtml" class="ce-markdown" v-html="renderedHtml" />
      <slot name="body-end" />
      <slot name="empty" v-if="!renderedHtml && !loading" />
    </div>

    <slot name="footer" :toc="toc" :frontmatter="frontmatter" :readingTime="readingTime" />
  </div>
</template>

<script setup lang="ts">
// Markdown 内容渲染器 - 支持预渲染 HTML 和运行时 Markdown 转换，提供多个具名插槽
import { renderToHTML } from '@markdown'

const props = defineProps({
  value: { type: Object, default: () => ({}) },
  content: { type: String, default: '' },
  theme: { type: String, default: 'default' }
})

const renderedHtml = ref('')
const loading = ref(false)

const prerenderedHtml = computed(() => {
  const source = props.value
  if (!source || typeof source === 'string') return ''
  const parts = []
  if (typeof source.introHtml === 'string' && source.introHtml.trim()) parts.push(source.introHtml)
  if (typeof source.bodyHtml === 'string' && source.bodyHtml.trim()) parts.push(source.bodyHtml)
  if (typeof source.summaryHtml === 'string' && source.summaryHtml.trim()) parts.push(source.summaryHtml)
  if (parts.length) return parts.join('\n')
  if (typeof source.contentHtml === 'string' && source.contentHtml.trim()) return source.contentHtml
  return ''
})

const markdownString = computed(() => {
  if (prerenderedHtml.value) return ''
  if (typeof props.content === 'string' && props.content.trim()) return props.content
  const source = props.value || {}
  if (typeof source === 'string') return source
  if (typeof source.body === 'string' && source.body.trim()) return source.body
  if (typeof source.content === 'string' && source.content.trim()) return source.content
  return ''
})

watch(() => prerenderedHtml.value, (html) => {
  if (html) renderedHtml.value = html
}, { immediate: true })

watch(() => markdownString.value, async (md) => {
  if (!md) return
  loading.value = true
  try {
    renderedHtml.value = await renderToHTML(md)
  } catch (error) {
    console.error('[Renderer] Markdown 渲染失败:', error)
    renderedHtml.value = ''
  } finally {
    loading.value = false
  }
}, { immediate: true })

const frontmatter = computed(() => ({}))
const toc = computed(() => [])
const readingTime = computed(() => null)

const wrapperClass = computed(() => [
  'ce-markdown-renderer',
  `ce-theme-${props.theme}`
])

const innerClass = computed(() => [
  'ce-content',
  'prose',
  'prose-neutral',
  'dark:prose-invert',
  'max-w-none'
])
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

.ce-markdown :deep(h1),
.ce-markdown :deep(h2),
.ce-markdown :deep(h3),
.ce-markdown :deep(h4) {
  scroll-margin-top: 1rem;
}

.ce-markdown :deep(pre) {
  overflow-x: auto;
}
</style>
