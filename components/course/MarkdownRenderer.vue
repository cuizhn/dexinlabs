<template>
  <!-- Markdown 渲染组件：使用 Nuxt Content 渲染 Markdown + KaTeX -->
  <div class="markdown-body" ref="contentRef">
    <ContentRenderer :value="document" v-if="document" />
    <div v-else class="markdown-renderer__empty">内容加载中...</div>
  </div>
</template>

<script setup>
// Markdown 渲染组件：使用 Nuxt Content 的 ContentRenderer 渲染 Markdown 内容
// remark-math + rehype-katex 在 nuxt.config.js 中配置，自动处理数学公式
import { ref, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  document: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['rendered'])
const contentRef = ref(null)

// 渲染完成后提取目录
function extractToc() {
  if (!contentRef.value) return

  const headings = contentRef.value.querySelectorAll('h2, h3')
  const toc = Array.from(headings).map((heading) => ({
    id: heading.id,
    text: heading.textContent,
    depth: parseInt(heading.tagName.charAt(1)),
  }))

  emit('rendered', { toc })
}

watch(
  () => props.document,
  async (document) => {
    if (document) {
      await nextTick()
      extractToc()
    }
  },
  { immediate: true }
)

onMounted(async () => {
  if (props.document) {
    await nextTick()
    extractToc()
  }
})
</script>

<style scoped>
.markdown-renderer__empty {
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-text-muted);
}
</style>
