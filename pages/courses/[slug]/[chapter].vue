<template>
  <div class="chapter-page">
    <template v-if="course && chapter">
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

      <section class="chapter-page__body">
        <div class="container">
          <div class="chapter-page__layout">
            <aside class="chapter-page__sidebar">
              <CourseSidebar :course-id="course.id" :chapters="course.chapters" :current-slug="chapterSlug" />
            </aside>

            <div class="chapter-page__main">
              <div class="chapter-page__content">
                <ContentRenderer v-if="chapterDoc" :value="chapterDoc" />
                <div v-else class="chapter-page__empty">
                  <p>章节内容加载中...</p>
                </div>
              </div>

              <ChapterNav
                :course-id="course.id"
                :prev="prevChapter"
                :next="nextChapter"
              />
            </div>

            <aside v-if="tocItems.length" class="chapter-page__toc">
              <TocSidebar :items="tocItems" />
            </aside>
          </div>
        </div>
      </section>
    </template>

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
import { useCourse } from '~/modules/course/useCourse.js'
import CourseSidebar from '~/components/course/CourseSidebar.vue'
import TocSidebar from '~/components/course/TocSidebar.vue'
import ChapterNav from '~/components/course/ChapterNav.vue'

const route = useRoute()
const { getCourse, getChapter, getChapterNavigation } = useCourse()

const tocItems = ref([])

const courseSlug = computed(() => route.params.slug)
const chapterSlug = computed(() => route.params.chapter)

const course = computed(() => getCourse(courseSlug.value))
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

// 从渲染后的文档中提取目录
watch(chapterDoc, (doc) => {
  if (doc?.body?.toc?.links) {
    tocItems.value = doc.body.toc.links.map(link => ({
      id: link.id,
      text: link.text,
      depth: link.depth || 2,
    }))
  }
}, { immediate: true })

const navigation = computed(() => {
  if (!courseSlug.value || !chapterSlug.value) return { prev: null, next: null }
  return getChapterNavigation(courseSlug.value, chapterSlug.value)
})

const prevChapter = computed(() => navigation.value?.prev ?? null)
const nextChapter = computed(() => navigation.value?.next ?? null)

useSeoMeta(() => ({
  title: chapter.value
    ? `${chapter.value.title} - ${course.value?.title}`
    : '章节未找到',
}))

watch(
  [courseSlug, chapterSlug],
  () => { tocItems.value = [] },
  { immediate: true }
)
</script>

<style scoped>
.chapter-page { padding-bottom: var(--spacing-2xl); }
.chapter-page__header { padding: var(--spacing-lg) 0; background-color: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border); }
.chapter-page__breadcrumb { display: flex; align-items: center; gap: var(--spacing-xs); font-size: 0.875rem; margin-bottom: var(--spacing-sm); flex-wrap: wrap; }
.chapter-page__breadcrumb-link { color: var(--color-text-secondary); text-decoration: none; transition: color 0.2s ease; }
.chapter-page__breadcrumb-link:hover { color: var(--color-primary); }
.chapter-page__breadcrumb-sep { color: var(--color-text-light); }
.chapter-page__breadcrumb-current { color: var(--color-text-primary); font-weight: 500; }
.chapter-page__title { font-size: 1.75rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
.chapter-page__body { padding: var(--spacing-xl) 0; }
.chapter-page__layout { display: grid; grid-template-columns: 240px 1fr 220px; gap: var(--spacing-xl); align-items: start; }
.chapter-page__sidebar { position: relative; }
.chapter-page__main { min-width: 0; }
.chapter-page__content { background-color: var(--color-bg-white); padding: var(--spacing-2xl); border-radius: var(--border-radius-lg); border: 1px solid var(--color-border); box-shadow: var(--shadow-sm); }
.chapter-page__toc { position: relative; }
.chapter-page__empty { padding: var(--spacing-2xl); text-align: center; color: var(--color-text-muted); }
.chapter-page__not-found { padding: var(--spacing-2xl) 0; text-align: center; }
.chapter-page__not-found-title { font-size: 1.5rem; font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--spacing-sm); }
.chapter-page__not-found-text { color: var(--color-text-secondary); margin-bottom: var(--spacing-lg); }
.chapter-page__back-link { display: inline-block; padding: var(--spacing-sm) var(--spacing-lg); background-color: var(--color-primary); color: #fff; text-decoration: none; border-radius: var(--border-radius-md); font-weight: 500; }

@media (max-width: 1024px) {
  .chapter-page__layout { grid-template-columns: 220px 1fr; }
  .chapter-page__toc { display: none; }
}

@media (max-width: 768px) {
  .chapter-page__layout { grid-template-columns: 1fr; }
  .chapter-page__sidebar { display: none; }
  .chapter-page__title { font-size: 1.375rem; }
  .chapter-page__content { padding: var(--spacing-lg); }
}
</style>
