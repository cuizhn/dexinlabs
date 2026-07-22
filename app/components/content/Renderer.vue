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

/** 渲染器接受的内容源：可以是预渲染 HTML 字段或原始 Markdown 字段 */
interface RenderableContent {
  /** 预渲染的引言 HTML */
  introHtml?: string | null
  /** 预渲染的正文 HTML */
  bodyHtml?: string | null
  /** 预渲染的总结 HTML */
  summaryHtml?: string | null
  /** 预渲染的完整内容 HTML（兼容旧格式） */
  contentHtml?: string | null
  /** 原始 Markdown 正文 */
  body?: string | null
  /** 原始 Markdown 内容（兼容旧格式） */
  content?: string | null
}

const props = defineProps<{
  /** 内容对象（预渲染 HTML 或原始 Markdown） */
  value?: RenderableContent
  /** 原始 Markdown 字符串（优先级低于 value 中的预渲染字段） */
  content?: string
  /** 主题名称，映射到 ce-theme-{name} CSS 类 */
  theme?: string
}>()

const renderedHtml = ref('')
const loading = ref(false)

/** 渲染序号计数器：每次新渲染递增，异步完成后对比序号，过期结果丢弃 */
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

/** 预渲染 HTML 变化时直接赋值（同步，无竞态风险） */
watch(() => prerenderedHtml.value, (html) => {
  if (html) renderedHtml.value = html
}, { immediate: true })

/**
 * 运行时 Markdown 渲染：使用 renderId 防止竞态
 * 每次触发渲染时递增 renderId，异步完成后仅当 ID 匹配时才更新结果
 */
watch(() => markdownString.value, async (md) => {
  if (!md) return
  const currentId = ++renderId
  loading.value = true
  try {
    const html = await renderToHTML(md)
    // 仅当本次渲染仍是最新时才更新，避免旧渲染覆盖新结果
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

// TODO: 以下三个占位 computed 暴露给 slot，待后续实现真实数据
const frontmatter = computed(() => ({}))
const toc = computed(() => [] as string[])
const readingTime = computed(() => null as number | null)

const wrapperClass = computed(() => [
  'ce-markdown-renderer',
  `ce-theme-${props.theme || 'default'}`
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
