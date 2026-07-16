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
/**
 * Markdown.vue — 项目唯一官方 Vue Adapter（MIGRATION.md §6 强制路径 app/components/markdown/Markdown.vue）
 *
 * 【职责】（仅做以下 3 件事，任何新增功能如解析/注册插件/AST 处理都应放入 Markdown Engine）：
 *   1. 规范化四种输入来源（value / content / document / ast → 统一 markdown 字符串）
 *   2. 调用独立维护的 Markdown Engine（@markdown）公共 API，获取渲染产物
 *   3. 把 Engine 的结构化输出（HTML / TOC / frontmatter / readingTime）转交给 Vue 层展示
 *
 * 【严格禁止】（违反任意一条属于 Legacy Implementation，需打回重写）：
 *   - Markdown Parsing：禁止 marked.parse() / markdown-it 等直接写在这里，必须走 Engine
 *   - Plugin Registration：禁止直接在组件内 registerPlugin；如需启用自定义插件请在 Application 层（plugins/engine.*）通过 `@markdown` 的 `createEngine({ builtin: [...] })` 配置或显式 `registerPlugin()` 统一入口注入
 *   - AST Processing：禁止自己 walk children 取文本、slug 生成、TOC 构建——全部用 Engine 的 plugin
 *   - HTML Rendering Logic：禁止手写 AST→HTML 字符串拼接，必须使用 Engine.rendered 的产物
 */
import { ref, computed, watch } from 'vue'
import { getEngine } from '@markdown'

const props = defineProps({
  value: { type: Object, default: () => ({}) },
  document: { type: Object, default: null },
  ast: { type: Object, default: null },
  content: { type: String, default: '' },
  theme: { type: String, default: 'default' },
  fallback: { type: Boolean, default: true }
})

const renderedHtml = ref('')
const metadata = ref({ frontmatter: {}, toc: [], readingTime: null })
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
  const source = props.document || props.value || {}
  if (source.frontmatter && typeof source.frontmatter === 'object') return source.frontmatter
  if (props.ast?.frontmatter && typeof props.ast.frontmatter === 'object') return props.ast.frontmatter
  return {}
})

const toc = computed(() => {
  if (Array.isArray(metadata.value.toc) && metadata.value.toc.length > 0) {
    return metadata.value.toc
  }
  const source = props.document || props.value || {}
  if (Array.isArray(source._toc) && source._toc.length > 0) return source._toc
  if (Array.isArray(props.ast?.toc)) return props.ast.toc
  return []
})

const readingTime = computed(() => {
  if (metadata.value.readingTime != null) return metadata.value.readingTime
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
