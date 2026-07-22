<template>
  <div class="topic-detail">
    <template v-if="topic">
      <section class="topic-detail__header">
        <div class="container">
          <nav class="topic-detail__breadcrumb">
            <NuxtLink to="/map" class="topic-detail__bc-link">知识地图</NuxtLink>
            <span class="topic-detail__bc-sep">/</span>
            <NuxtLink
              v-if="domainSlug"
              :to="`/${domainSlug}`"
              class="topic-detail__bc-link"
            >
              {{ domain?.title || '' }}
            </NuxtLink>
            <span class="topic-detail__bc-sep">/</span>
            <span class="topic-detail__bc-current">{{ topic.title }}</span>
          </nav>
        </div>
      </section>

      <section class="topic-detail__body">
        <div class="container topic-detail__layout">
          <div class="topic-detail__main">
            <ol v-if="lessons.length" class="lesson-list">
              <li v-for="(lesson, idx) in lessons" :key="lesson.slug" class="lesson-list__item">
                <NuxtLink :to="`/${domainSlug}/${topicSlug}/${lesson.slug}`" class="lesson-list__link">
                  <span class="lesson-list__index">{{ String(idx + 1).padStart(2, '0') }}</span>

                  <div class="lesson-list__info">
                    <span class="lesson-list__title">{{ lesson.title }}</span>

                    <span v-if="lesson.summary" class="lesson-list__desc">
                      {{ lesson.summary }}
                    </span>
                  </div>

                  <span class="lesson-list__arrow">→</span>
                </NuxtLink>
              </li>
            </ol>
          </div>

          <aside class="topic-detail__side">
            <NuxtLink :to="`/exercise?topic=${topicSlug}`" class="exercise-card">
              <div class="exercise-card__icon">✦</div>

              <div class="exercise-card__body">
                <h3 class="exercise-card__title">练习</h3>
                <p class="exercise-card__desc">巩固所学，训练数学思维</p>
              </div>

              <span class="exercise-card__cta">开始练习 →</span>
            </NuxtLink>
          </aside>
        </div>
      </section>
    </template>

    <div v-else class="topic-detail__empty">暂未找到该主题</div>
  </div>
</template>

<script setup lang="ts">
/**
 * Topic 知识主题详情页 - 展示主题下的课时列表与练习入口
 */
const topicSlug = useRouteParam('topic') ?? ''
const domainSlug = useRouteParam('domain') ?? ''

const { topic, domain, lessons } = await useTopicPage(topicSlug)

useHead({
  title: computed(() => topic.value?.title || '主题')
})
</script>

<style scoped>
.topic-detail__header {
  padding: var(--spacing-xl) 0 var(--spacing-lg);
  background: linear-gradient(180deg, var(--color-bg-secondary), transparent);
}
.topic-detail__breadcrumb {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
  font-size: 0.875rem;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}
.topic-detail__bc-link {
  color: var(--color-text-secondary);
  text-decoration: none;
}
.topic-detail__bc-link:hover {
  color: var(--color-primary);
}
.topic-detail__bc-sep {
  color: var(--color-text-light);
}
.topic-detail__bc-current {
  color: var(--color-text-primary);
  font-weight: 500;
}
.topic-detail__body {
  padding: var(--spacing-xl) 0 var(--spacing-3xl);
}
.topic-detail__layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--spacing-xl);
  align-items: start;
}
.topic-detail__main {
  min-width: 0;
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
.topic-detail__empty {
  padding: var(--spacing-3xl) 0;
  color: var(--color-text-muted);
}
@media (max-width: 900px) {
  .topic-detail__layout {
    grid-template-columns: 1fr;
  }
  .exercise-card {
    position: static;
  }
}
</style>
