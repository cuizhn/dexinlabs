<template>
  <!-- Topic 课时列表 - 显示每个 Lesson 的状态、标题和预计时间 -->
  <div class="list">
    <h3 class="title">{{ title }}</h3>

    <ol class="items">
      <li
        v-for="(lesson, idx) in lessons"
        :key="lesson.slug"
        class="item"
        :class="{ completed: getLessonState(lesson.slug).isCompleted }"
      >
        <NuxtLink :to="`/courses/${topicSlug}/${lesson.slug}`" class="link">
          <span class="index">
            <template v-if="getLessonState(lesson.slug).isCompleted">✓</template>
            <template v-else>{{ String(idx + 1).padStart(2, '0') }}</template>
          </span>

          <div class="info">
            <span class="lesson-title">{{ lesson.title }}</span>
          </div>

          <span class="arrow">→</span>
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
}

defineProps<{
  /** 课时列表数据 */
  lessons: LessonItem[]
  /** 所属 Topic 的 slug */
  topicSlug: string
  /** 列表标题（如「课时」） */
  title?: string
}>()

const { getLessonState } = useLearningState()
</script>

<style scoped>
.list {
  margin-bottom: var(--spacing-xl);
}

.title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg);
}

.items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.link {
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

.link:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.item.completed .link {
  border-color: var(--color-success-border);
  background: var(--color-success-bg);
}

.index {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--color-primary);
  min-width: 2.25rem;
  text-align: center;
}

.item.completed .index {
  color: var(--color-success-dark);
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.lesson-title {
  font-weight: 600;
  color: var(--color-text-primary);
}

.arrow {
  color: var(--color-text-light);
  font-weight: 500;
  transition: transform 150ms ease;
}

.link:hover .arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}
</style>
