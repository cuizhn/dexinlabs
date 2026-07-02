<template>
  <div class="lesson-detail">
    <section class="lesson-detail__header">
      <div class="container lesson-detail__container">
        <nav class="lesson-detail__breadcrumb">
          <NuxtLink to="/course" class="lesson-detail__bc-link">课程中心</NuxtLink>

          <span class="lesson-detail__bc-sep">/</span>

          <NuxtLink v-if="chapterSlug" :to="`/course/${chapterSlug}`" class="lesson-detail__bc-link">
            {{ chapterTitle || '章节' }}
          </NuxtLink>

          <span class="lesson-detail__bc-sep">/</span>

          <span class="lesson-detail__bc-current">{{ lesson?.title || '课时' }}</span>
        </nav>
      </div>
    </section>

    <section class="lesson-detail__body">
      <div class="container lesson-detail__container">
        <div v-if="loading" class="lesson-detail__empty">课时内容加载中...</div>

        <ContentRenderer v-else-if="lesson" :value="lesson" />

        <div v-else class="lesson-detail__empty">课时内容未找到</div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useHead, useRoute } from 'nuxt/app'

import { computed } from 'vue'

import { useChapter } from '~/composables/useChapter'

import { useLesson } from '~/composables/useLesson'

const route = useRoute()

const chapterSlug = Array.isArray(route.params.chapter) ? route.params.chapter[0] : route.params.chapter

const lessonSlug = Array.isArray(route.params.lesson) ? route.params.lesson[0] : route.params.lesson

useHead({
  title: computed(() => (lesson.value ? `${lesson.value.title} · 课时` : '课时'))
})

const { lesson, loading, loadLesson } = useLesson()

const { currentChapter, loadChapter } = useChapter()

if (chapterSlug) await loadChapter(chapterSlug)

if (lessonSlug) await loadLesson(lessonSlug)

const chapterTitle = computed(() => currentChapter.value && currentChapter.value.title)
</script>

<style scoped>
.lesson-detail__header {
  padding: var(--spacing-lg) 0;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}
.lesson-detail__container {
  max-width: 760px;
}
.lesson-detail__breadcrumb {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
  font-size: 0.875rem;
  flex-wrap: wrap;
}
.lesson-detail__bc-link {
  color: var(--color-text-secondary);
  text-decoration: none;
}
.lesson-detail__bc-link:hover {
  color: var(--color-primary);
}
.lesson-detail__bc-sep {
  color: var(--color-text-light);
}
.lesson-detail__bc-current {
  color: var(--color-text-primary);
  font-weight: 500;
}
.lesson-detail__body {
  padding: var(--spacing-2xl) 0 var(--spacing-3xl);
}
.lesson-detail__empty {
  padding: var(--spacing-3xl) 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}
</style>
