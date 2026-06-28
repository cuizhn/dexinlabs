<!-- 路由 URL 匹配规则：/course/:chapter/:lesson，例如 /course/basic-algebra/linear-equations -->
<!-- 页面用途：课时正文详情页，用于展示单个课时的 Markdown 课程正文内容 -->
<template>
  <!-- 根容器：课时详情页整体布局包裹 -->
  <div class="lesson-detail">
    <!-- 顶部 header 区块：展示面包屑导航，提供页面层级跳转 -->
    <section class="lesson-detail__header">
      <!-- 内容容器：限制最大宽度居中 -->
      <div class="container lesson-detail__container">
        <!-- 面包屑导航栏：三级路径 课程中心 → 章节 → 课时 -->
        <nav class="lesson-detail__breadcrumb">
          <!-- 返回课程中心链接：固定跳转到 /course 路由（课程列表总览页） -->
          <NuxtLink to="/course" class="lesson-detail__bc-link">课程中心</NuxtLink>
          <!-- 面包屑分隔符：斜杠 -->
          <span class="lesson-detail__bc-sep">/</span>
          <!-- 章节链接：当 chapterSlug 存在时，跳转到 /course/:chapter 章节详情页，展示章节标题或占位"章节" -->
          <NuxtLink v-if="chapterSlug" :to="`/course/${chapterSlug}`" class="lesson-detail__bc-link">
            {{ chapterTitle || '章节' }}
          </NuxtLink>
          <!-- 面包屑分隔符：斜杠 -->
          <span class="lesson-detail__bc-sep">/</span>
          <!-- 当前课时标识：展示课时标题或占位"课时"，不可点击 -->
          <span class="lesson-detail__bc-current">{{ lesson?.title || '课时' }}</span>
        </nav>
      </div>
    </section>

    <!-- 正文 body 区块：展示课时主体内容，含三种分支（加载中 / 正常渲染 / 404未找到） -->
    <section class="lesson-detail__body">
      <!-- 内容容器：限制最大宽度居中 -->
      <div class="container lesson-detail__container">
        <!-- 分支一：loading 为 true 时展示加载中占位文案 -->
        <div v-if="loading" class="lesson-detail__empty">课时内容加载中...</div>
        <!-- 分支二：lesson 存在时，使用 ContentRenderer 渲染课时正文，数据源为 lesson 对象（含 body 字段） -->
        <!-- ContentRenderer 是 @nuxt/content 内置组件，接收 lesson 对象后自动读取其 Markdown 正文（body/description 等字段）渲染为 HTML -->
        <ContentRenderer v-else-if="lesson" :value="lesson as any" />
        <!-- 分支三（404 错误逻辑）：既非加载中又无 lesson 数据时，展示"课时内容未找到"空状态（即课时不存在或加载失败） -->
        <div v-else class="lesson-detail__empty">课时内容未找到</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// 从 nuxt/app 导入 useHead（设置页面 <head> 元信息，如 title）和 useRoute（获取当前路由对象及 params 参数）
import { useHead, useRoute } from 'nuxt/app'
// 从 vue 导入 computed（创建计算属性，响应式地派生数据，如 chapterTitle、页面 title）
import { computed } from 'vue'
// 导入 useChapter composable：封装章节数据的加载与状态，提供 currentChapter（章节详情）和 loadChapter 方法
// 最终 API endpoint：GET /api/chapter/:chapterSlug（通过 ChapterRepository.findBySlug 调用）
import { useChapter } from '~/composables/useChapter'
// 导入 useLesson composable：封装课时数据的加载与状态，提供 lesson（课时详情）、loading（加载状态）和 loadLesson 方法
// 最终 API endpoint：GET /api/lesson/:lessonSlug（通过 LessonRepository.findBySlug 调用）
import { useLesson } from '~/composables/useLesson'

// 调用 useRoute() 获取当前路由实例，用于读取动态路由 params 中的 chapter 和 lesson 片段
const route = useRoute()
// 路由参数 chapter 提取流程：params.chapter 可能是字符串或字符串数组（catch-all 路由时为数组）
// 判断若是数组则取第一个元素，否则直接使用字符串值，最终得到统一的 string 类型 chapterSlug
const chapterSlug = Array.isArray(route.params.chapter)
  ? route.params.chapter[0]
  : route.params.chapter
// 路由参数 lesson 提取流程：与 chapter 同理，从 params.lesson 中提取统一的 string 类型 lessonSlug
const lessonSlug = Array.isArray(route.params.lesson)
  ? route.params.lesson[0]
  : route.params.lesson

// 调用 useHead 设置页面 meta 信息
// title 计算逻辑：lesson.value 存在时拼接 "{课时标题} · 课时"，否则回退为 "课时"
useHead({
  title: computed(() => (lesson.value ? `${lesson.value!.title} · 课时` : '课时')),
})

// 调用 useLesson composable 解构出：
// - lesson：响应式 Ref，承载课时详情（含 title、body、description 等字段用于 ContentRenderer 渲染）
// - loading：响应式 Ref<boolean>，加载中状态，驱动 template 加载中分支显示
// - loadLesson：异步方法，传入 lessonSlug 请求课时数据
const { lesson, loading, loadLesson } = useLesson()
// 调用 useChapter composable 解构出：
// - currentChapter：响应式 Ref，承载所属章节详情（含 title 用于面包屑）
// - loadChapter：异步方法，传入 chapterSlug 请求章节数据
const { currentChapter, loadChapter } = useChapter()

// chapterSlug 有值时，调用 loadChapter(chapterSlug) 发起请求 GET /api/chapter/:chapterSlug
if (chapterSlug) await loadChapter(chapterSlug)
// lessonSlug 有值时，调用 loadLesson(lessonSlug) 发起请求 GET /api/lesson/:lessonSlug
if (lessonSlug) await loadLesson(lessonSlug)

// 计算属性 chapterTitle：从 currentChapter.value（章节详情对象）上取 .title 字段，用于面包屑的章节标题展示
const chapterTitle = computed(() => currentChapter.value?.title)
</script>

<style scoped>
.lesson-detail__header {
  padding: var(--spacing-lg) 0;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}
.lesson-detail__container { max-width: 760px; }
.lesson-detail__breadcrumb {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
  font-size: 0.875rem;
  flex-wrap: wrap;
}
.lesson-detail__bc-link { color: var(--color-text-secondary); text-decoration: none; }
.lesson-detail__bc-link:hover { color: var(--color-primary); }
.lesson-detail__bc-sep { color: var(--color-text-light); }
.lesson-detail__bc-current { color: var(--color-text-primary); font-weight: 500; }
.lesson-detail__body { padding: var(--spacing-2xl) 0 var(--spacing-3xl); }
.lesson-detail__empty {
  padding: var(--spacing-3xl) 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}
</style>
