<!-- 页面路径: /courses/[slug]/[chapter] -->
<!-- 章节阅读页：三栏布局（左侧章节侧边栏 + 中间内容区 + 右侧目录），含面包屑导航和上下章切换 -->
<template>
  <div class="chapter-page">
    <template v-if="course && chapter">
      <!-- 页面头部：面包屑导航和章节标题 -->
      <section class="chapter-page__header">
        <div class="container">
          <nav class="chapter-page__breadcrumb">
            <NuxtLink to="/courses" class="chapter-page__breadcrumb-link">课程</NuxtLink>
            <span class="chapter-page__breadcrumb-sep">/</span>
            <NuxtLink :to="`/courses/${course.id}`" class="chapter-page__breadcrumb-link">{{ course.title }}</NuxtLink>
            <span class="chapter-page__breadcrumb-sep">/</span>
            <span class="chapter-page__breadcrumb-current">{{ chapter.title }}</span>
          </nav>
          <h1 class="chapter-page__title">{{ chapter.title }}</h1>
        </div>
      </section>

      <!-- 主体内容区：三栏布局 -->
      <section class="chapter-page__body">
        <div class="container">
          <div class="chapter-page__layout">
            <!-- 左侧：章节导航侧边栏 -->
            <aside class="chapter-page__sidebar">
              <CourseSidebar :course-id="course.id" :chapters="course.chapters" :current-slug="chapterSlug" />
            </aside>

            <!-- 中间：章节正文内容 -->
            <div class="chapter-page__main">
              <div class="chapter-page__content">
                <!-- 使用 Nuxt Content 渲染 Markdown 章节文档 -->
                <MarkdownRenderer v-if="chapterDoc" :value="chapterDoc" />
                <!-- 文档加载中提示 -->
                <div v-else class="chapter-page__empty">
                  <p>章节内容加载中...</p>
                </div>
              </div>

              <!-- 上下章节导航组件 -->
              <ChapterNav
                :course-id="course.id"
                :prev="prevChapter"
                :next="nextChapter"
              />
            </div>

            <!-- 右侧：文章目录（TOC）侧边栏，仅在有目录项时显示 -->
            <aside v-if="tocItems.length" class="chapter-page__toc">
              <TocSidebar :items="tocItems" />
            </aside>
          </div>
        </div>
      </section>
    </template>

    <!-- 章节未找到提示 -->
    <section v-if="!course || !chapter" class="chapter-page__not-found">
      <div class="container container-sm text-center">
        <h2 class="chapter-page__not-found-title">章节未找到</h2>
        <p class="chapter-page__not-found-text">请检查链接是否正确</p>
        <NuxtLink to="/courses" class="chapter-page__back-link">返回课程列表</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCourse } from '~/composables/course/useCourse.js'
import CourseSidebar from '~/components/course/CourseSidebar.vue'
import TocSidebar from '~/components/course/TocSidebar.vue'
import ChapterNav from '~/components/course/ChapterNav.vue'

// 获取当前路由信息
const route = useRoute()
// 获取课程相关方法
const { getCourse, getChapter, getChapterNavigation } = useCourse()

// 目录项列表，从文档的 toc 中提取
const tocItems = ref([])

// 计算属性：从路由参数中获取课程 slug
const courseSlug = computed(() => route.params.slug)
// 计算属性：从路由参数中获取章节 slug
const chapterSlug = computed(() => route.params.chapter)

// 计算属性：当前课程数据
const course = computed(() => getCourse(courseSlug.value))
// 计算属性：当前章节数据
const chapter = computed(() => getChapter(courseSlug.value, chapterSlug.value))

// 使用 Nuxt Content 查询章节文档
const { data: chapterDoc } = await useAsyncData(
  `chapter-${courseSlug.value}-${chapterSlug.value}`,
  () => {
    return queryCollection('chapters')
      .path(`/courses/${courseSlug.value}/${chapterSlug.value}`)
      .first()
  },
  { watch: [courseSlug, chapterSlug] }
)



// 计算属性：章节导航信息（上一章/下一章）
const navigation = computed(() => {
  if (!courseSlug.value || !chapterSlug.value) return { prev: null, next: null }
  return getChapterNavigation(courseSlug.value, chapterSlug.value)
})

// 计算属性：上一章数据
const prevChapter = computed(() => navigation.value?.prev ?? null)
// 计算属性：下一章数据
const nextChapter = computed(() => navigation.value?.next ?? null)

// 设置 SEO 元信息
useSeoMeta(() => ({
  title: chapter.value
    ? `${chapter.value.title} - ${course.value?.title}`
    : '章节未找到',
}))

// 监听路由变化，切换章节时清空目录项
watch(
  [() => route.params.slug, () => route.params.chapter],
  () => { tocItems.value = [] },
  { immediate: true }
)
</script>

<style scoped>
/* ==================== 页面布局 ==================== */
/* 页面根容器 */
.chapter-page { padding-bottom: var(--spacing-2xl); }
/* 页面头部：灰色背景，底部带分隔线 */
.chapter-page__header { padding: var(--spacing-lg) 0; background-color: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border); }
/* 面包屑导航：横向排列 */
.chapter-page__breadcrumb { display: flex; align-items: center; gap: var(--spacing-xs); font-size: 0.875rem; margin-bottom: var(--spacing-sm); flex-wrap: wrap; }
/* 面包屑链接 */
.chapter-page__breadcrumb-link { color: var(--color-text-secondary); text-decoration: none; transition: color 0.2s ease; }
/* 面包屑链接悬停 */
.chapter-page__breadcrumb-link:hover { color: var(--color-primary); }
/* 面包屑分隔符 */
.chapter-page__breadcrumb-sep { color: var(--color-text-light); }
/* 当前页面文字：加粗主色 */
.chapter-page__breadcrumb-current { color: var(--color-text-primary); font-weight: 500; }
/* 章节标题 */
.chapter-page__title { font-size: 1.75rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }

/* ==================== 主体内容区 ==================== */
/* 内容区域 */
.chapter-page__body { padding: var(--spacing-xl) 0; }
/* 三栏网格布局：侧边栏(240px) + 主内容区(自适应) + 目录(220px) */
.chapter-page__layout { display: grid; grid-template-columns: 240px 1fr 220px; gap: var(--spacing-xl); align-items: start; }
/* 左侧侧边栏 */
.chapter-page__sidebar { position: relative; }
/* 中间主内容区 */
.chapter-page__main { min-width: 0; }
/* 章节正文容器：白底卡片样式 */
.chapter-page__content { background-color: var(--color-bg-white); padding: var(--spacing-2xl); border-radius: var(--border-radius-lg); border: 1px solid var(--color-border); box-shadow: var(--shadow-sm); }
/* 右侧目录栏 */
.chapter-page__toc { position: relative; }
/* 空状态提示 */
.chapter-page__empty { padding: var(--spacing-2xl); text-align: center; color: var(--color-text-muted); }

/* ==================== 未找到提示 ==================== */
.chapter-page__not-found { padding: var(--spacing-2xl) 0; text-align: center; }
.chapter-page__not-found-title { font-size: 1.5rem; font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--spacing-sm); }
.chapter-page__not-found-text { color: var(--color-text-secondary); margin-bottom: var(--spacing-lg); }
.chapter-page__back-link { display: inline-block; padding: var(--spacing-sm) var(--spacing-lg); background-color: var(--color-primary); color: #fff; text-decoration: none; border-radius: var(--border-radius-md); font-weight: 500; }

/* ==================== 响应式适配 ==================== */
/* 平板端（≤1024px）：隐藏右侧目录栏，两栏布局 */
@media (max-width: 1024px) {
  .chapter-page__layout { grid-template-columns: 220px 1fr; }
  .chapter-page__toc { display: none; }
}

/* 手机端（≤768px）：单栏布局，隐藏左侧侧边栏 */
@media (max-width: 768px) {
  .chapter-page__layout { grid-template-columns: 1fr; }
  .chapter-page__sidebar { display: none; }
  .chapter-page__title { font-size: 1.375rem; }
  .chapter-page__content { padding: var(--spacing-lg); }
}
</style>
