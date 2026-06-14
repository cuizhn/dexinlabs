<template>
  <div class="chapter-page">
    <!-- 正常页面 -->
    <template v-if="course && chapter">

      <!-- Header -->
      <section class="chapter-page__header">
        <div class="container">
          <nav class="chapter-page__breadcrumb">
            <NuxtLink to="/courses" class="chapter-page__breadcrumb-link">
              课程
            </NuxtLink>

            <span class="chapter-page__breadcrumb-sep">/</span>

            <NuxtLink
              :to="`/courses/${course.id}`"
              class="chapter-page__breadcrumb-link"
            >
              {{ course.title }}
            </NuxtLink>

            <span class="chapter-page__breadcrumb-sep">/</span>

            <span class="chapter-page__breadcrumb-current">
              {{ chapter.title }}
            </span>
          </nav>

          <h1 class="chapter-page__title">
            {{ chapter.title }}
          </h1>
        </div>
      </section>

      <!-- Body -->
      <section class="chapter-page__body">
        <div class="container">
          <div class="chapter-page__layout">

            <!-- 左侧课程目录 -->
            <aside class="chapter-page__sidebar">
              <CourseSidebar
                :course-id="course.id"
                :chapters="course.chapters"
                :current-slug="chapterSlug"
              />
            </aside>

            <!-- 主内容区 -->
            <div class="chapter-page__main">

              <div class="chapter-page__content">

                <!-- Markdown 渲染（核心 V1） -->
                <MarkdownRenderer
                  v-if="chapterDoc"
                  :document="chapterDoc"
                  @rendered="handleRendered"
                />

                <div v-else class="chapter-page__empty">
                  <p>章节内容加载中...</p>
                </div>

              </div>

              <!-- 上一章 / 下一章 -->
              <ChapterNav
                :course-id="course.id"
                :prev="prevChapter"
                :next="nextChapter"
              />

            </div>

            <!-- 右侧 TOC -->
            <aside v-if="tocItems.length" class="chapter-page__toc">
              <TocSidebar :items="tocItems" />
            </aside>

          </div>
        </div>
      </section>
    </template>

    <!-- 404 -->
    <section v-else class="chapter-page__not-found">
      <div class="container container-sm text-center">
        <h2 class="chapter-page__not-found-title">
          章节未找到
        </h2>

        <p class="chapter-page__not-found-text">
          请检查链接是否正确
        </p>

        <NuxtLink
          to="/courses"
          class="chapter-page__back-link"
        >
          返回课程列表
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useAsyncData, useSeoMeta, createError } from '#imports'
import { queryCollection } from '@nuxt/content/server'

import { useCourse } from '~/modules/course/useCourse.js'

import CourseSidebar from '~/components/course/CourseSidebar.vue'
import TocSidebar from '~/components/course/TocSidebar.vue'
import ChapterNav from '~/components/course/ChapterNav.vue'
import MarkdownRenderer from '~/components/MarkdownRenderer.vue'

/* =========================
 * 路由参数
 * ========================= */
const route = useRoute()

const courseSlug = computed(() => route.params.slug)
const chapterSlug = computed(() => route.params.chapter)

/* =========================
 * 课程元数据（本地）
 * ========================= */
const { getCourse, getChapter, getChapterNavigation } = useCourse()

const course = computed(() =>
  getCourse(courseSlug.value)
)

const chapter = computed(() =>
  getChapter(courseSlug.value, chapterSlug.value)
)

/* =========================
 * slug（核心业务ID）
 * ========================= */
const contentSlug = computed(() =>
  `${courseSlug.value}-${chapterSlug.value}`
)

/* =========================
 * Nuxt Content 查询
 * ========================= */
const { data: chapterDoc } = await useAsyncData(
  () => `chapter-${contentSlug.value}`,
  () =>
    queryCollection('chapters')
      .where('slug', '=', contentSlug.value)
      .first(),
  {
    watch: [contentSlug],
  }
)

/* =========================
 * TOC（来自 MarkdownRenderer）
 * ========================= */
const tocItems = ref([])

function handleRendered({ toc }) {
  tocItems.value = toc ?? []
}

/* =========================
 * 上一章 / 下一章
 * ========================= */
const navigation = computed(() => {
  if (!courseSlug.value || !chapterSlug.value) {
    return { prev: null, next: null }
  }

  return getChapterNavigation(
    courseSlug.value,
    chapterSlug.value,
  )
})

const prevChapter = computed(() =>
  navigation.value?.prev ?? null
)

const nextChapter = computed(() =>
  navigation.value?.next ?? null
)

/* =========================
 * SEO
 * ========================= */
useSeoMeta(() => ({
  title: chapter.value
    ? `${chapter.value.title} · ${course.value?.title}`
    : '章节未找到',

  description:
    chapterDoc.value?.description ??
    `${course.value?.title ?? ''} 数学课程章节`,

  ogTitle: chapter.value?.title,
  ogDescription: chapterDoc.value?.description,
}))

/* =========================
 * 404（推荐方式）
 * ========================= */
if (!course.value || !chapter.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Chapter Not Found',
  })
}
</script>

<style scoped>
.chapter-page {
  padding-bottom: var(--spacing-2xl);
}

.chapter-page__header {
  padding: var(--spacing-lg) 0;
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.chapter-page__breadcrumb {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
  font-size: 0.875rem;
  margin-bottom: var(--spacing-sm);
}

.chapter-page__breadcrumb-link {
  color: var(--color-text-secondary);
  text-decoration: none;
}

.chapter-page__breadcrumb-link:hover {
  color: var(--color-primary);
}

.chapter-page__breadcrumb-sep {
  color: var(--color-text-light);
}

.chapter-page__breadcrumb-current {
  color: var(--color-text-primary);
  font-weight: 500;
}

.chapter-page__title {
  font-size: 1.75rem;
  font-weight: 700;
}

.chapter-page__body {
  padding: var(--spacing-xl) 0;
}

.chapter-page__layout {
  display: grid;
  grid-template-columns:
    minmax(220px, 240px)
    minmax(0, 1fr)
    220px;
  gap: var(--spacing-xl);
  align-items: start;
}

.chapter-page__main {
  min-width: 0;
}

.chapter-page__content {
  background: var(--color-bg-white);
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.chapter-page__toc {
  position: sticky;
  top: 80px;
}

.chapter-page__sidebar {
  position: sticky;
  top: 80px;
}

.chapter-page__empty {
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-text-muted);
}

.chapter-page__not-found {
  padding: var(--spacing-2xl) 0;
  text-align: center;
}

.chapter-page__not-found-titl