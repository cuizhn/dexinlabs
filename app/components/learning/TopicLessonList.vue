<template>
  <!-- Topic 课时列表 - 显示每个 Lesson 的状态、标题和预计时间 -->
  <div class="topic-lesson-list">
    <h3 class="topic-lesson-list__title">{{ title }}</h3>

    <ol class="topic-lesson-list__items">
      <li
        v-for="(lesson, idx) in lessons"
        :key="lesson.slug"
        class="topic-lesson-list__item"
        :class="{ 'topic-lesson-list__item--completed': getLessonState(lesson.slug).isCompleted }"
      >
        <NuxtLink :to="`/${domainSlug}/${topicSlug}/${lesson.slug}`" class="topic-lesson-list__link">
          <span class="topic-lesson-list__index">
            <template v-if="getLessonState(lesson.slug).isCompleted">✓</template>
            <template v-else>{{ String(idx + 1).padStart(2, '0') }}</template>
          </span>

          <div class="topic-lesson-list__info">
            <span class="topic-lesson-list__lesson-title">{{ lesson.title }}</span>
            <span v-if="lesson.summary" class="topic-lesson-list__lesson-desc">{{ lesson.summary }}</span>
          </div>

          <span class="topic-lesson-list__arrow">→</span>
        </NuxtLink>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
/**
 * TopicLessonList - Topic 课时列表组件
 *
 * Topic 页面中展示该 Topic 下所有 Lesson 的列表。
 * 每个 Lesson 显示状态（已完成/未完成）、标题和简介。
 * 学习状态由 useLearningState 统一提供。
 */
import { useLearningState } from '~/composables/useLearningState'

interface LessonItem {
  slug: string
  title: string
  summary?: string | null
}

defineProps<{
  /** 课时列表数据 */
  lessons: LessonItem[]
  /** 所属 Domain 的 slug */
  domainSlug: string
  /** 所属 Topic 的 slug */
  topicSlug: string
  /** 列表标题（如「课时」） */
  title?: string
}>()

const { getLessonState } = useLearningState()
</script>

<style scoped>
.topic-lesson-list {
  margin-bottom: var(--spacing-xl);
}

.topic-lesson-list__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg);
}

.topic-lesson-list__items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.topic-lesson-list__link {
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

.topic-lesson-list__link:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.topic-lesson-list__item--completed .topic-lesson-list__link {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.02);
}

.topic-lesson-list__index {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-primary);
  min-width: 2.25rem;
  text-align: center;
}

.topic-lesson-list__item--completed .topic-lesson-list__index {
  color: #16a34a;
}

.topic-lesson-list__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.topic-lesson-list__lesson-title {
  font-weight: 600;
  color: var(--color-text-primary);
}

.topic-lesson-list__lesson-desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.topic-lesson-list__arrow {
  color: var(--color-text-light);
  font-weight: 500;
  transition: transform 150ms ease;
}

.topic-lesson-list__link:hover .topic-lesson-list__arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}
</style>
