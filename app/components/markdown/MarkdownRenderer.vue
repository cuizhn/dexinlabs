<!--
  MarkdownRenderer 组件 - Markdown 渲染器
  功能说明：
  - 使用 Nuxt Content 的 ContentRenderer 渲染由父组件传入的 Markdown 文档
  - 数学公式通过 remark-math + rehype-katex 自动处理（在 nuxt.config.js 中配置）
  - 渲染完成后自动提取页面中的 h2、h3 标题生成目录数据
  - 通过 rendered 事件将目录数据传递给父组件，供 TocSidebar 使用
  - 文档未加载时显示加载中占位文本
-->
<template>
  <div class="markdown-body" ref="contentRef">
    <!-- 使用 Nuxt Content 渲染父组件传入的文档对象 -->
    <ContentRenderer v-if="value" :value="value" />
    <!-- 文档未加载时的占位提示 -->
    <div v-else class="markdown-renderer__empty">内容加载中...</div>
  </div>
</template>

<script setup>
/**
 * Markdown 渲染组件：接收父组件传入的文档对象并渲染
 * 父组件（[chapter].vue）通过 :value="chapterDoc" 传入已查询好的文档
 * remark-math + rehype-katex 在 nuxt.config.js 中配置，自动处理数学公式
 * @component MarkdownRenderer
 */
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  /** Nuxt Content 解析后的文档对象，由父组件通过 :value 传入 */
  value: {
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

// 监听传入文档的变化，文档更新后重新提取目录
watch(
  () => props.value,
  () => {
    if (props.value) {
      // 延迟执行，等待 DOM 更新完成后再提取目录
      setTimeout(extractToc, 100)
    }
  },
  { immediate: true }
)

// 组件挂载时，如果文档已存在则提取目录
onMounted(() => {
  if (props.value) {
    setTimeout(extractToc, 100)
  }
})
</script>


<style scoped>
/* 加载中占位文本：居中、弱化颜色 */
.markdown-renderer__empty {
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-text-muted);
}
</style>
