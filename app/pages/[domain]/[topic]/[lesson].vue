<template>
  <div class="lesson-detail">
    <header class="lesson-detail__header">
      <div class="container lesson-detail__container">
        <NuxtLink
          :to="`/${domainSlug}/${topicSlug}`"
          class="lesson-detail__back"
        >
          ←
        </NuxtLink>

        <h1 class="lesson-detail__title">{{ lesson?.title || '学习' }}</h1>

        <span class="lesson-detail__progress">{{ lessonIndex }} / {{ totalLessons }}</span>
      </div>
    </header>

    <main class="lesson-detail__body">
      <div class="container lesson-detail__container">
        <div v-if="loading" class="lesson-detail__empty">内容加载中...</div>
        <ContentRenderer v-else-if="lesson" :value="lesson" />
        <div v-else class="lesson-detail__empty">内容未找到</div>

        <nav v-if="previousLesson || nextLesson" class="lesson-detail__nav">
          <NuxtLink
            v-if="previousLesson"
            :to="`/${domainSlug}/${topicSlug}/${previousLesson.slug}`"
            class="lesson-detail__nav-link lesson-detail__nav-link--prev"
          >
            ← {{ previousLesson.title }}
          </NuxtLink>
          <span v-else />
          <NuxtLink
            v-if="nextLesson"
            :to="`/${domainSlug}/${topicSlug}/${nextLesson.slug}`"
            class="lesson-detail__nav-link lesson-detail__nav-link--next"
          >
            {{ nextLesson.title }} →
          </NuxtLink>
        </nav>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const lessonSlug = useRouteParam('lesson') ?? ''
const topicSlug = useRouteParam('topic') ?? ''
const domainSlug = useRouteParam('domain') ?? ''

const { lesson, previousLesson, nextLesson, loading } = await useLessonPage(lessonSlug)

const lessonIndex = computed(() => lesson.value?.order ?? 1)
const totalLessons = computed(() => {
  const total = previousLesson.value ? lessonIndex.value : lessonIndex.value
  if (nextLesson.value) return total + 1
  return total
})

useHead({
  title: computed(() => lesson.value?.title || '学习')
})
</script>

<style scoped>
.lesson-detail__header {
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-border);
}

.lesson-detail__container {
  max-width: 760px;
}

.lesson-detail__back {
  font-size: 1.25rem;
  color: var(--color-text-light);
  text-decoration: none;
  transition: color 150ms ease;
}

.lesson-detail__back:hover {
  color: var(--color-text-secondary);
}

.lesson-detail__title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin: 0;
}

.lesson-detail__progress {
  font-size: 0.875rem;
  color: var(--color-text-light);
  font-family: var(--font-mono);
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

.lesson-detail__nav {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
}

.lesson-detail__nav-link {
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 150ms ease;
  max-width: 45%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lesson-detail__nav-link--prev {
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.lesson-detail__nav-link--prev:hover {
  border-color: var(--color-primary);
}

.lesson-detail__nav-link--next {
  background: linear-gradient(135deg, var(--color-primary), #6366f1);
  color: #fff;
  margin-left: auto;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
}

.lesson-detail__nav-link--next:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4);
}
</style>