<template>
  <div :class="wrapperClass" data-ce-markdown-renderer>
    <slot name="header" :toc="toc" :frontmatter="frontmatter" />

    <div :class="innerClass" class="ce-content-body">
      <slot name="body-start" />
      <div v-if="renderedHtml" class="ce-markdown" v-html="renderedHtml" />
      <slot name="body-end" />
      <slot name="empty" v-if="!renderedHtml" />
    </div>

    <slot name="footer" :toc="toc" :frontmatter="frontmatter" :readingTime="readingTime" />
  </div>
</template>

<script setup>
import { marked } from 'marked'

marked.setOptions({
  gfm: true,
  breaks: true,
  mangle: false,
  headerIds: true
})

const props = defineProps({
  value: { type: Object, default: () => ({}) },
  document: { type: Object, default: null },
  ast: { type: Object, default: null },
  theme: { type: String, default: 'default' },
  fallback: { type: Boolean, default: true }
})

const source = props.document || props.value || {}

const frontmatter = computed(() => {
  if (source.frontmatter && typeof source.frontmatter === 'object') return source.frontmatter
  if (props.ast?.frontmatter && typeof props.ast.frontmatter === 'object') return props.ast.frontmatter
  return {}
})

const toc = computed(() => {
  if (Array.isArray(source._toc) && source._toc.length > 0) return source._toc
  if (Array.isArray(props.ast?.toc)) return props.ast.toc
  return []
})

const readingTime = computed(() => {
  if (source._readingTime != null) return source._readingTime
  if (props.ast?.readingTime != null) return props.ast.readingTime
  return null
})

const markdownString = computed(() => {
  if (typeof props.ast?.content === 'string' && props.ast.content.trim()) {
    return props.ast.content
  }
  if (typeof source.body === 'string' && source.body.trim()) {
    return source.body
  }
  if (typeof source.content === 'string' && source.content.trim()) {
    return source.content
  }
  if (typeof source === 'string') return source
  return ''
})

const renderedHtml = computed(() => {
  const md = markdownString.value
  if (!md) return ''
  try {
    return marked.parse(md) || ''
  } catch (e) {
    return ''
  }
})

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
