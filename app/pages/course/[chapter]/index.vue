<template>
  <div class="chapter-detail">
    <template v-if="currentChapter">
      <section class="chapter-detail__header">
        <div class="container">
          <nav class="chapter-detail__breadcrumb">
            <NuxtLink to="/course" class="chapter-detail__bc-link">课程中心</NuxtLink>

            <span class="chapter-detail__bc-sep">/</span>

            <span class="chapter-detail__bc-current">{{ currentChapter.title }}</span>
          </nav>
        </div>
      </section>

      <section class="chapter-detail__body">
        <div class="container chapter-detail__layout">
          <div class="chapter-detail__main">
            <h2 class="chapter-detail__section-title">课时内容</h2>

            <!-- <ol v-if="lessons.length" class="lesson-list">
              <li v-for="(lesson, idx) in lessons" :key="lesson.slug" class="lesson-list__item">
                <NuxtLink :to="`/course/${chapterSlug}/${lesson.slug}`" class="lesson-list__link">
                  <span class="lesson-list__index">{{ String(idx + 1).padStart(2, '0') }}</span>

                  <div class="lesson-list__info">
                    <span class="lesson-list__title">{{ lesson.title }}</span>

                    <span v-if="lesson.description" class="lesson-list__desc">
                      {{ lesson.description }}
                    </span>
                  </div>

                  <span class="lesson-list__arrow">→</span>
                </NuxtLink>
              </li>
            </ol> -->

            
          </div>

          <aside class="chapter-detail__side">
            <NuxtLink :to="`/exercise/${chapterSlug}`" class="exercise-card">
              <div class="exercise-card__icon">✦</div>

              <div class="exercise-card__body">
                <h3 class="exercise-card__title">章节练习</h3>
                <p class="exercise-card__desc">巩固所学，训练数学思维</p>
              </div>

              <span class="exercise-card__cta">开始练习 →</span>
            </NuxtLink>
          </aside>
        </div>
      </section>
    </template>

    <div v-else class="chapter-detail__empty">暂未找到该章节</div>
  </div>
</template>

<script setup>
import { useHead, useRoute } from 'nuxt/app'
import { computed } from 'vue'

const route = useRoute()
const chapterSlug = route.params.chapter

const { currentChapter } = await useChapter(chapterSlug)

useHead({
  title: computed(() => (currentChapter.value ? `${currentChapter.value.title} · 章节` : '章节'))
})
</script>

<style scoped>
.chapter-detail__header {
  padding: var(--spacing-xl) 0 var(--spacing-lg);
  background: linear-gradient(180deg, var(--color-bg-secondary), transparent);
}
.chapter-detail__breadcrumb {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
  font-size: 0.875rem;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}
.chapter-detail__bc-link {
  color: var(--color-text-secondary);
  text-decoration: none;
}
.chapter-detail__bc-link:hover {
  color: var(--color-primary);
}
.chapter-detail__bc-sep {
  color: var(--color-text-light);
}
.chapter-detail__bc-current {
  color: var(--color-text-primary);
  font-weight: 500;
}
.chapter-detail__title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}
.chapter-detail__desc {
  font-size: 1rem;
  color: var(--color-text-secondary);
  max-width: 640px;
  line-height: 1.6;
  margin: 0;
}
.chapter-detail__body {
  padding: var(--spacing-xl) 0 var(--spacing-3xl);
}
.chapter-detail__layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--spacing-xl);
  align-items: start;
}
.chapter-detail__main {
  min-width: 0;
}
.chapter-detail__section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg);
}
.lesson-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.lesson-list__link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  color: inherit;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
}
.lesson-list__link:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}
.lesson-list__index {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-primary);
  min-width: 2.25rem;
}
.lesson-list__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.lesson-list__title {
  font-weight: 600;
  color: var(--color-text-primary);
}
.lesson-list__desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}
.lesson-list__arrow {
  color: var(--color-text-light);
  font-weight: 500;
  transition: transform 150ms ease;
}
.lesson-list__link:hover .lesson-list__arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}
.exercise-card {
  display: block;
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #fff;
  text-decoration: none;
  border-radius: var(--border-radius-lg);
  position: sticky;
  top: 80px;
}
.exercise-card__icon {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-sm);
}
.exercise-card__title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 4px;
  color: #fff;
}
.exercise-card__desc {
  font-size: 0.875rem;
  opacity: 0.85;
  margin: 0 0 var(--spacing-lg);
}
.exercise-card__cta {
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 500;
}
.chapter-detail__empty {
  padding: var(--spacing-3xl) 0;
  color: var(--color-text-muted);
}
.chapter-detail__back {
  display: inline-block;
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-primary);
  color: #fff;
  text-decoration: none;
  border-radius: var(--border-radius-md);
  font-weight: 500;
}
@media (max-width: 900px) {
  .chapter-detail__layout {
    grid-template-columns: 1fr;
  }
  .exercise-card {
    position: static;
  }
}
</style>
