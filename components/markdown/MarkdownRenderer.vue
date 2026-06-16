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
  <!-- Markdown 内容容器 -->
  <div class="markdown-body" ref="contentRef">
    <!-- 使用 Nuxt Content 渲染 Markdown 文档 -->
    <ContentRenderer v-if="chapterDoc" :value="chapterDoc" />
    <!-- 文档未加载时的占位提示 -->
    <div v-else class="markdown-renderer__empty">内容维修中...</div>
  </div>
</template>

<script setup>
/**
 * Markdown 渲染组件：使用 Nuxt Content 的 ContentRenderer 渲染 Markdown 内容
 * remark-math + rehype-katex 在 nuxt.config.js 中配置，自动处理数学公式
 * @component MarkdownRenderer
 */
import { ref, watch, onMounted } from 'vue'

// 获取当前路由信息
const route = useRoute()

// 计算属性：从路由参数中获取课程 slug
const courseSlug = computed(() => route.params.slug)
// 计算属性：从路由参数中获取章节 slug
const chapterSlug = computed(() => route.params.chapter)


// 使用 Nuxt Content 查询章节文档
const { data: chapterDoc } = await useAsyncData(
  `chapter-${courseSlug.value}-${chapterSlug.value}`,
  () => {
    return queryCollection('chapters')
      .path(`/courses/${courseSlug.value}/${chapterSlug.value}`)
      .first()
  },

)
const props = defineProps({
  /** Nuxt Content 解析后的文档对象，为 null 时显示加载中 */
  document: {
    type: Object,
    default: null,
  },
})

/** 渲染完成事件，携带目录数据 { toc } 传递给父组件 */
const emit = defineEmits(['rendered'])

/** 内容容器的模板引用，用于查询 DOM 提取标题 */
const contentRef = ref(null)

/**
 * 从渲染后的 DOM 中提取目录数据
 * 查找所有 h2、h3 标题元素，收集其 id、文本内容和层级深度
 * 提取完成后通过 rendered 事件将目录数据发送给父组件
 */
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

// 监听 document prop 变化，文档更新后重新提取目录
watch(
  () => props.document,
  () => {
    if (props.document) {
      // 延迟执行，等待 DOM 更新完成后再提取目录
      setTimeout(extractToc, 100)
    }
  },
  { immediate: true }
)

// 组件挂载时，如果文档已存在则提取目录
onMounted(() => {
  if (props.document) {
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
