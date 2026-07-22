<template>
  <div class="topic-detail">
    <template v-if="topic">
      <header class="topic-detail__header">
        <div class="container">
          <NuxtLink :to="`/${domainSlug}`" class="topic-detail__back">←</NuxtLink>
          <h1 class="topic-detail__title">{{ topic.title }}</h1>
        </div>
      </header>

      <section class="topic-detail__hero">
        <div class="container">
          <p class="topic-detail__objective">
            学完这一主题，你将能够{{ topic.summary || '掌握相关知识与技能。' }}
          </p>

          <NuxtLink
            v-if="lessons.length"
            :to="`/${domainSlug}/${topicSlug}/${lessons[0].slug}`"
            class="topic-detail__btn topic-detail__btn--primary"
          >
            开始学习
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </NuxtLink>
        </div>
      </section>

      <section class="topic-detail__body">
        <div class="container">
          <div v-if="lessons.length" class="topic-detail__lessons">
            <h2 class="topic-detail__section-title">课时</h2>

            <ol class="lesson-list">
              <li v-for="(lesson, idx) in lessons" :key="lesson.slug" class="lesson-list__item">
                <NuxtLink :to="`/${domainSlug}/${topicSlug}/${lesson.slug}`" class="lesson-list__link">
                  <span class="lesson-list__index">{{ String(idx + 1).padStart(2, '0') }}</span>

                  <div class="lesson-list__info">
                    <span class="lesson-list__title">{{ lesson.title }}</span>
                    <span v-if="lesson.summary" class="lesson-list__desc">{{ lesson.summary }}</span>
                  </div>

                  <span class="lesson-list__arrow">→</span>
                </NuxtLink>
              </li>
            </ol>
          </div>

          <div v-if="lessons.length" class="topic-detail__exercise">
            <NuxtLink :to="`/exercise?topic=${topicSlug}`" class="exercise-card">
              <div class="exercise-card__icon">✦</div>
              <div class="exercise-card__body">
                <h3 class="exercise-card__title">练习</h3>
                <p class="exercise-card__desc">巩固所学，训练数学思维</p>
              </div>
              <span class="exercise-card__cta">开始练习 →</span>
            </NuxtLink>
          </div>
        </div>
      </section>
    </template>

    <div v-else class="topic-detail__empty">暂未找到该主题</div>
  </div>
</template>

<script setup lang="ts">
const topicSlug = useRouteParam('topic') ?? ''
const domainSlug = useRouteParam('domain') ?? ''

const { topic, lessons } = await useTopicPage(topicSlug)

useHead({
  title: computed(() => topic.value?.title || '主题')
})
</script>

<style scoped>
.topic-detail__header {
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-border);
}

.topic-detail__back {
  font-size: 1.25rem;
  color: var(--color-text-light);
  text-decoration: none;
  transition: color 150ms ease;
}

.topic-detail__back:hover {
  color: var(--color-text-secondary);
}

.topic-detail__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.topic-detail__hero {
  padding: var(--spacing-3xl) 0;
  text-align: center;
}

.topic-detail__objective {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  line-height: 1.75;
  max-width: 640px;
  margin: 0 auto var(--spacing-xl);
}

.topic-detail__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  font-size: 0.9375rem;
  text-decoration: none;
  transition: all 0.25s ease;
}

.topic-detail__btn--primary {
  background: linear-gradient(135deg, var(--color-primary), #6366f1);
  color: #fff;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
}

.topic-detail__btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4);
}

.topic-detail__body {
  padding: var(--spacing-xl) 0 var(--spacing-3xl);
}

.topic-detail__section-title {
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
  transition: border-color 150ms ease, box-shadow 150ms ease;
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

.topic-detail__exercise {
  margin-top: var(--spacing-2xl);
}

.exercise-card {
  display: block;
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #fff;
  text-decoration: none;
  border-radius: var(--border-radius-lg);
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

.topic-detail__empty {
  padding: var(--spacing-3xl) 0;
  color: var(--color-text-muted);
  text-align: center;
}

@media (max-width: 900px) {
  .topic-detail__objective {
    font-size: 1.125rem;
  }
}
</style>