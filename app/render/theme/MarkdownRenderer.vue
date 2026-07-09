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
import { getEngine } from '@me'

const props = defineProps({
  value: { type: Object, default: () => ({}) },
  document: { type: Object, default: null },
  ast: { type: Object, default: null },
  content: { type: String, default: '' },
  theme: { type: String, default: 'default' },
  fallback: { type: Boolean, default: true }
})

const renderedHtml = ref('')
const enhancedAST = ref(null)
const loading = ref(false)

const markdownString = computed(() => {
  if (typeof props.content === 'string' && props.content.trim()) {
    return props.content
  }
  if (props.ast && typeof props.ast.content === 'string' && props.ast.content.trim()) {
    return props.ast.content
  }
  const source = props.document || props.value || {}
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
    enhancedAST.value = null
    return
  }
  loading.value = true
  try {
    const engine = getEngine()
    const result = await engine.run(md, { renderTarget: 'html' })
    renderedHtml.value = result.rendered || ''
    enhancedAST.value = result.enhancedAST
  } catch (e) {
    renderedHtml.value = ''
  } finally {
    loading.value = false
  }
}, { immediate: true })

const frontmatter = computed(() => {
  if (enhancedAST.value?.frontmatter && typeof enhancedAST.value.frontmatter === 'object') {
    return enhancedAST.value.frontmatter
  }
  const source = props.document || props.value || {}
  if (source.frontmatter && typeof source.frontmatter === 'object') return source.frontmatter
  if (props.ast?.frontmatter && typeof props.ast.frontmatter === 'object') return props.ast.frontmatter
  return {}
})

const toc = computed(() => {
  if (Array.isArray(enhancedAST.value?.toc) && enhancedAST.value.toc.length > 0) {
    return enhancedAST.value.toc
  }
  const source = props.document || props.value || {}
  if (Array.isArray(source._toc) && source._toc.length > 0) return source._toc
  if (Array.isArray(props.ast?.toc)) return props.ast.toc
  return []
})

const readingTime = computed(() => {
  if (enhancedAST.value?.readingTime != null) return enhancedAST.value.readingTime
  const source = props.document || props.value || {}
  if (source._readingTime != null) return source._readingTime
  if (props.ast?.readingTime != null) return props.ast.readingTime
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
