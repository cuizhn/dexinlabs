<!-- 页面路径: /courses/[slug]/[chapter] -->
<!-- 章节阅读页：展示章节内容和导航 -->
<template>
  <div class="chapter-page">
    <!-- 面包屑导航 -->
    <section class="chapter-page__header">
      <div class="container">
        <nav class="chapter-page__breadcrumb">
          <NuxtLink to="/courses" class="chapter-page__breadcrumb-link">课程</NuxtLink>
          <span class="chapter-page__breadcrumb-sep">/</span>
          <NuxtLink :to="`/courses/${courseSlug}`" class="chapter-page__breadcrumb-link">{{ course?.title }}</NuxtLink>
          <span class="chapter-page__breadcrumb-sep">/</span>
          <span class="chapter-page__breadcrumb-current">{{ chapter?.title }}</span>
        </nav>
        <h1 class="chapter-page__title">{{ chapter?.title }}</h1>
      </div>
    </section>

    <!-- 主体内容 -->
    <section class="chapter-page__body">
      <div class="container">
        <div class="chapter-page__layout">
          <!-- 左侧：课程目录 -->
          <aside class="chapter-page__sidebar">
            <CourseSidebar
              :course-id="courseSlug"
              :chapters="course?.chapters || []"
              :current-slug="chapterSlug"
            />
          </aside>

          <!-- 中间：章节内容 -->
          <div class="chapter-page__main">
            <article class="chapter-page__content">
              <ContentRenderer v-if="chapterContent" :doc="chapterContent" />
              <div v-else class="chapter-page__empty">
                <p>章节内容加载中...</p>
              </div>
            </article>

            <!-- 上下章导航 -->
            <ChapterNav
              v-if="course"
              :course-id="course.id"
              :prev="prevChapter"
              :next="nextChapter"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 404 -->
    <section v-if="!chapter" class="chapter-page__not-found">
      <div class="container container-sm text-center">
        <h2>章节未找到</h2>
        <p>请检查链接是否正确</p>
        <NuxtLink to="/courses">返回课程列表</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCourse } from '~/composables/course/useCourse'
import { useChapter } from '~/composables/course/useChapter'
import CourseSidebar from '~/components/course/CourseSidebar.vue'
import ChapterNav from '~/components/course/ChapterNav.vue'

const route = useRoute()
const courseSlug = route.params.slug as string
const chapterSlug = route.params.chapter as string

// 获取课程数据（含章节列表）
const { getCourse } = useCourse()
const { data: course } = await useAsyncData(`course-${courseSlug}`, () => getCourse(courseSlug))

// 获取章节内容
const { getChapter } = useChapter()
const { data: chapterContent } = await useAsyncData(`chapter-${courseSlug}-${chapterSlug}`, () => getChapter(courseSlug, chapterSlug))

// 当前章节信息（从课程数据中获取）
const chapter = computed(() => {
  return course.value?.chapters.find(ch => ch.slug === chapterSlug)
})

// 章节导航
const chapters = computed(() => course.value?.chapters || [])
const currentIndex = computed(() => chapters.value.findIndex(ch => ch.slug === chapterSlug))
const prevChapter = computed(() => currentIndex.value > 0 ? chapters.value[currentIndex.value - 1] : null)
const nextChapter = computed(() => currentIndex.value < chapters.value.length - 1 ? chapters.value[currentIndex.value + 1] : null)

// SEO
useSeoMeta(() => ({
  title: chapter.value ? `${chapter.value.title} - ${course.value?.title}` : '章节未找到',
  description: chapterContent.value?.description,
}))

// 404 处理
if (!chapter.value) {
  throw createError({ statusCode: 404, statusMessage: '章节不存在' })
}
</script>

<style scoped>
.chapter-page { padding-bottom: var(--spacing-2xl); }
.chapter-page__header { padding: var(--spacing-lg) 0; background-color: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border); }
.chapter-page__breadcrumb { display: flex; gap: var(--spacing-xs); flex-wrap: wrap; font-size: 0.875rem; margin-bottom: var(--spacing-sm); }
.chapter-page__breadcrumb-link { color: var(--color-text-secondary); text-decoration: none; }
.chapter-page__breadcrumb-link:hover { color: var(--color-primary); }
.chapter-page__breadcrumb-sep { color: var(--color-text-light); }
.chapter-page__breadcrumb-current { color: var(--color-text-primary); font-weight: 500; }
.chapter-page__title { font-size: 1.75rem; font-weight: 700; margin: 0; }
.chapter-page__body { padding: var(--spacing-xl) 0; }
.chapter-page__layout { display: grid; grid-template-columns: 240px 1fr; gap: var(--spacing-xl); align-items: start; }
.chapter-page__sidebar { position: sticky; top: 80px; }
.chapter-page__main { min-width: 0; }
.chapter-page__content { background: var(--color-bg-white); padding: var(--spacing-2xl); border-radius: var(--border-radius-lg); border: 1px solid var(--color-border); box-shadow: var(--shadow-sm); }
.chapter-page__empty { padding: var(--spacing-2xl); text-align: center; color: var(--color-text-muted); }
.chapter-page__not-found { padding: var(--spacing-2xl) 0; text-align: center; }

@media (max-width: 1024px) {
  .chapter-page__layout { grid-template-columns: 220px 1fr; }
}

@media (max-width: 768px) {
  .chapter-page__layout { grid-template-columns: 1fr; }
  .chapter-page__sidebar { display: none; }
  .chapter-page__content { padding: var(--spacing-lg); }
}
</style>
