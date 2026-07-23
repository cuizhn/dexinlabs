<template>
  <div class="topic-page">
    <LearningHeader
      :title="topic?.title || '主题'"
      :back-path="`/${domainSlug}`"
      :show-menu="true"
    />

    <main class="topic-page__main">
      <section class="topic-page__intro">
        <p class="topic-page__objective">
          学完这一主题，你将能够{{ topic?.summary || '掌握相关知识与技能。' }}
        </p>

        <p class="topic-page__significance">
          这一主题是数学知识体系中的重要环节，帮助你建立从基础到进阶的桥梁。
        </p>
      </section>

      <section class="topic-page__body">
        <LearningTopicLessonList
          v-if="lessons.length"
          :lessons="lessons"
          :domain-slug="domainSlug"
          :topic-slug="topicSlug"
          title="课时列表"
        />

        <div class="topic-page__actions">
          <template v-if="topicState.state === LearningState.NOT_STARTED">
            <NuxtLink
              v-if="lessons.length"
              :to="firstLessonPath"
              class="topic-page__btn topic-page__btn--primary"
            >
              开始学习
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </NuxtLink>
          </template>

          <template v-else-if="topicState.state === LearningState.IN_PROGRESS">
            <NuxtLink
              v-if="lessons.length"
              :to="firstLessonPath"
              class="topic-page__btn topic-page__btn--primary"
            >
              继续学习
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </NuxtLink>
          </template>

          <template v-else>
            <NuxtLink
              :to="`/exercise?topic=${topicSlug}`"
              class="topic-page__btn topic-page__btn--primary"
            >
              练习巩固
            </NuxtLink>
            <NuxtLink
              v-if="lessons.length"
              :to="firstLessonPath"
              class="topic-page__btn topic-page__btn--secondary"
            >
              复习回顾
            </NuxtLink>
          </template>
        </div>

        <div v-if="lessons.length" class="topic-page__exercise">
          <NuxtLink :to="`/exercise?topic=${topicSlug}`" class="exercise-card">
            <div class="exercise-card__icon">✦</div>
            <div class="exercise-card__body">
              <h3 class="exercise-card__title">练习</h3>
              <p class="exercise-card__desc">巩固所学，训练数学思维</p>
            </div>
            <span class="exercise-card__cta">开始练习 →</span>
          </NuxtLink>
        </div>
      </section>
    </main>

    <div class="topic-page__bottom" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'learning'
})

import { LearningState, useLearningState } from '~/composables/useLearningState'

const topicSlug = useRouteParam('topic') ?? ''
const domainSlug = useRouteParam('domain') ?? ''

const { topic, lessons } = await useTopicPage(topicSlug)

const { getTopicState } = useLearningState()

const topicState = computed(() => getTopicState(topicSlug, lessons.value.length))

const firstLessonPath = computed(() =>
  lessons.value[0] ? `/${domainSlug}/${topicSlug}/${lessons.value[0].slug}` : ''
)

useHead({
  title: computed(() => topic.value?.title || '主题')
})
</script>

<style scoped>
.topic-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.topic-page__main {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.topic-page__intro {
  margin-bottom: var(--spacing-2xl);
}

.topic-page__objective {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  line-height: 1.75;
  max-width: 640px;
  margin: 0 0 var(--spacing-md);
}

.topic-page__significance {
  font-size: 0.9375rem;
  color: var(--color-text-light);
  line-height: 1.6;
  max-width: 640px;
  margin: 0;
}

.topic-page__body {
  margin-top: var(--spacing-xl);
}

.topic-page__actions {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
  flex-wrap: wrap;
}

.topic-page__btn {
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

.topic-page__btn--primary {
  background: linear-gradient(135deg, var(--color-primary), #6366f1);
  color: #fff;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
}

.topic-page__btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4);
}

.topic-page__btn--secondary {
  background: var(--color-bg-white);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.topic-page__btn--secondary:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.topic-page__exercise {
  margin-top: var(--spacing-xl);
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

.topic-page__bottom {
  height: var(--spacing-xl);
}

@media (max-width: 768px) {
  .topic-page__main {
    padding: var(--spacing-lg);
  }

  .topic-page__objective {
    font-size: 1rem;
  }

  .topic-page__actions {
    flex-direction: column;
  }

  .topic-page__btn {
    width: 100%;
    justify-content: center;
  }
}
</style>