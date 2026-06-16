<!--
  MarkdownRenderer 组件 - Markdown 渲染器
  功能说明：
  - 使用 Nuxt Content 的 ContentRenderer 渲染 Markdown 文档内容
  - 数学公式通过 remark-math + rehype-katex 自动处理（在 nuxt.config.js 中配置）
  - 渲染完成后自动提取页面中的 h2、h3 标题生成目录数据
  - 通过 rendered 事件将目录数据传递给父组件，供 TocSidebar 使用
  - 文档未加载时显示加载中占位文本
-->
<template>
  <div class="markdown-body" ref="contentRef">
    <!-- 使用 Nuxt Content 渲染传入的 Markdown 文档 -->
    <ContentRenderer v-if="document" :value="document" />
    <!-- 文档未加载时的占位提示 -->
    <div v-else class="markdown-renderer__empty">内容维修中...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

// 1. 定义 Props，只接收外部传入的文档对象
const props = defineProps({
  document: {
    type: Object,
    default: null,
  },
})

// 2. 定义事件，向父组件传递提取到的目录
const emit = defineEmits(['rendered'])

// 3. 内容容器的 DOM 引用
const contentRef = ref<HTMLElement | null>(null)

/**
 * 从渲染后的 DOM 中提取目录数据
 */
function extractToc() {
  if (!contentRef.value) return

  const headings = contentRef.value.querySelectorAll('h2, h3')
  const toc = Array.from(headings).map((heading) => ({
    id: heading.id,
    text: heading.textContent?.trim() || '',
    depth: parseInt(heading.tagName.charAt(1)),
  }))

  emit('rendered', { toc })
}

// 4. 监听 document prop 变化，使用 nextTick 确保 DOM 更新后再提取
watch(
  () => props.document,
  async (newVal) => {
    if (newVal) {
      await nextTick() // 替代 setTimeout，确保 Vue 完成 DOM 更新
      extractToc()
    }
  },
  { immediate: true }
)
</script>


<style scoped>
/* 加载中占位文本：居中、弱化颜色 */
.markdown-renderer__empty {
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-text-muted);
}
</style>
