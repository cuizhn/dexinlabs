<!-- 页面路径: /courses/[slug]/[chapter] -->
<!-- 章节阅读页 -->
<template>
  <div class="chapter-page">
    <template v-if="chapter">
      <!-- 头部 -->
      <section class="chapter-page__header">
        <div class="container">
          <nav class="chapter-page__breadcrumb">
            <NuxtLink to="/courses" class="chapter-page__breadcrumb-link">课程</NuxtLink>
            <span class="chapter-page__breadcrumb-sep">/</span>
            <NuxtLink :to="`/courses/${courseSlug}`" class="chapter-page__breadcrumb-link">{{ chapter.title }}</NuxtLink>
            <span class="chapter-page__breadcrumb-sep">/</span>
            <span class="chapter-page__breadcrumb-current">{{ chapter.title }}</span>
          </nav>
          <h1 class="chapter-page__title">{{ chapter.title }}</h1>
        </div>
      </section>

      <!-- 内容 -->
      <section class="chapter-page__body">
        <div class="container">
          <div class="chapter-page__layout">
            <!-- 左侧：章节列表 -->
            <aside class="chapter-page__sidebar">
              <CourseSidebar
                v-if="chapters.length"
                :course-slug="courseSlug"
                :chapters="chapters"
                :current-slug="chapterSlug"
              />
            </aside>

            <!-- 中间：正文 -->
            <div class="chapter-page__main">
              <div class="chapter-page__content">
                <ContentRenderer v-if="chapter.content" :value="chapter.content" />
                <div v-else class="chapter-page__empty">章节内容加载中...</div>
              </div>

              <!-- 上下章导航 -->
              <ChapterNav
                :course-slug="courseSlug"
                :prev="prevChapter"
                :next="nextChapter"
              />
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- 404 -->
    <section v-if="!chapter" class="chapter-page__not-found">
      <div class="container container-sm text-center">
        <h2 class="chapter-page__not-found-title">章节未找到</h2>
        <p class="chapter-page__not-found-text">请检查链接是否正确</p>
        <NuxtLink to="/courses" class="chapter-page__back-link">返回课程列表</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
// 页面职责：加载数据和显示数据
const route = useRoute()
const courseSlug = route.params.slug
const chapterSlug = route.params.chapter

// 数据加载
const { chapter, chapters, prevChapter, nextChapter } = await useChapterDetail(courseSlug, chapterSlug)

// SEO
useSeoMeta({
  title: chapter?.title || '章节',
  description: chapter?.description,
})
</script>

<style scoped>
.chapter-page { padding-bottom: var(--spacing-2xl); }
.chapter-page__header { padding: var(--spacing-lg) 0; background-color: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border); }
.chapter-page__breadcrumb { display: flex; align-items: center; gap: var(--spacing-xs); font-size: 0.875rem; margin-bottom: var(--spacing-sm); flex-wrap: wrap; }
.chapter-page__breadcrumb-link { color: var(--color-text-secondary); text-decoration: none; }
.chapter-page__breadcrumb-link:hover { color: var(--color-primary); }
.chapter-page__breadcrumb-sep { color: var(--color-text-light); }
.chapter-page__breadcrumb-current { color: var(--color-text-primary); font-weight: 500; }
.chapter-page__title { font-size: 1.75rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
.chapter-page__body { padding: var(--spacing-xl) 0; }
.chapter-page__layout { display: grid; grid-template-columns: 240px 1fr 220px; gap: var(--spacing-xl); align-items: start; }
.chapter-page__sidebar { position: sticky; top: 80px; }
.chapter-page__main { min-width: 0; }
.chapter-page__content { background-color: var(--color-bg-white); padding: var(--spacing-2xl); border-radius: var(--border-radius-lg); border: 1px solid var(--color-border); box-shadow: var(--shadow-sm); }
.chapter-page__empty { padding: var(--spacing-2xl); text-align: center; color: var(--color-text-muted); }
.chapter-page__not-found { padding: var(--spacing-2xl) 0; text-align: center; }
.chapter-page__not-found-title { font-size: 1.5rem; font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--spacing-sm); }
.chapter-page__not-found-text { color: var(--color-text-secondary); margin-bottom: var(--spacing-lg); }
.chapter-page__back-link { display: inline-block; padding: var(--spacing-sm) var(--spacing-lg); background-color: var(--color-primary); color: #fff; text-decoration: none; border-radius: var(--border-radius-md); font-weight: 500; }

@media (max-width: 1024px) {
  .chapter-page__layout { grid-template-columns: 220px 1fr; }
}

@media (max-width: 768px) {
  .chapter-page__layout { grid-template-columns: 1fr; }
  .chapter-page__sidebar { display: none; }
  .chapter-page__title { font-size: 1.375rem; }
  .chapter-page__content { padding: var(--spacing-lg); }
}
</style>
