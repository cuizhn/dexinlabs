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

<script setup>
import { ref, computed, watch } from 'vue'
import { getEngine } from '@markdown'

const props = defineProps({
  value: { type: Object, default: () => ({}) },
  content: { type: String, default: '' },
  theme: { type: String, default: 'default' }
})

const renderedHtml = ref('')
const metadata = ref({ frontmatter: {}, toc: [], readingTime: null })
const loading = ref(false)

const markdownString = computed(() => {
  if (typeof props.content === 'string' && props.content.trim()) {
    return props.content
  }
  const source = props.value || {}
  if (typeof source === 'string') return source
  if (typeof source.body === 'string' && source.body.trim()) {
    return source.body
  }
  if (typeof source.content === 'string' && source.content.trim()) {
    return source.content
  }
  return ''
})

watch(() => markdownString.value, async (md) => {
  if (!md) {
    renderedHtml.value = ''
    metadata.value = { frontmatter: {}, toc: [], readingTime: null }
    return
  }
  loading.value = true
  try {
    const engine = getEngine()
    const result = await engine.run(md, { renderTarget: 'html' })
    renderedHtml.value = result.rendered || ''
    metadata.value = result.metadata
  } catch (e) {
    renderedHtml.value = ''
  } finally {
    loading.value = false
  }
}, { immediate: true })

const frontmatter = computed(() => {
  if (metadata.value.frontmatter && typeof metadata.value.frontmatter === 'object') {
    return metadata.value.frontmatter
  }
  return {}
})

const toc = computed(() => {
  if (Array.isArray(metadata.value.toc) && metadata.value.toc.length > 0) {
    return metadata.value.toc
  }
  return []
})

const readingTime = computed(() => {
  if (metadata.value.readingTime != null) return metadata.value.readingTime
  return null
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
