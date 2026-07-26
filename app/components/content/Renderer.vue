<template>
  <div class="leading-[1.75]" data-ce-markdown-renderer>
    <slot name="header" :toc="toc" :frontmatter="frontmatter" />

    <div class="ce-content prose prose-neutral dark:prose-invert max-w-none">
      <slot name="body-start" />
      <div v-if="renderedHtml" class="ce-markdown markdown-body" v-html="renderedHtml" />
      <slot name="body-end" />
      <slot name="empty" v-if="!renderedHtml && !loading" />
    </div>

    <slot name="footer" :toc="toc" :frontmatter="frontmatter" :readingTime="readingTime" />
  </div>
</template>

<script setup lang="ts">
import { renderToHTML } from '@markdown'

interface RenderableContent {
  introHtml?: string | null
  bodyHtml?: string | null
  summaryHtml?: string | null
  contentHtml?: string | null
  body?: string | null
  content?: string | null
}

const props = defineProps<{
  value?: RenderableContent
  content?: string
  theme?: string
}>()

const renderedHtml = ref('')
const loading = ref(false)

let renderId = 0

const prerenderedHtml = computed(() => {
  const source = props.value
  if (!source) return ''
  const parts: string[] = []
  if (source.introHtml?.trim()) parts.push(source.introHtml)
  if (source.bodyHtml?.trim()) parts.push(source.bodyHtml)
  if (source.summaryHtml?.trim()) parts.push(source.summaryHtml)
  if (parts.length) return parts.join('\n')
  if (source.contentHtml?.trim()) return source.contentHtml
  return ''
})

const markdownString = computed(() => {
  if (prerenderedHtml.value) return ''
  if (props.content?.trim()) return props.content
  const source = props.value
  if (source?.body?.trim()) return source.body
  if (source?.content?.trim()) return source.content
  return ''
})

watch(() => prerenderedHtml.value, (html) => {
  if (html) renderedHtml.value = html
}, { immediate: true })

watch(() => markdownString.value, async (md) => {
  if (!md) return
  const currentId = ++renderId
  loading.value = true
  try {
    const html = await renderToHTML(md)
    if (renderId === currentId) {
      renderedHtml.value = html
    }
  } catch (error) {
    if (renderId === currentId) {
      console.error('[Renderer] Markdown 渲染失败:', error)
      renderedHtml.value = ''
    }
  } finally {
    if (renderId === currentId) {
      loading.value = false
    }
  }
}, { immediate: true })

const frontmatter = computed(() => ({}))
const toc = computed(() => [] as string[])
const readingTime = computed(() => null as number | null)
</script>
