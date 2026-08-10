<template>
  <nav class="catalog">
    <header class="catalog__header">
      <div class="container">
        <h1 class="catalog__title">课程目录</h1>
        <p class="catalog__desc">
          选择你想学习的课时，直接进入学习
        </p>
      </div>
    </header>

    <section class="catalog__body">
      <div class="container">
        <div v-if="loading" class="catalog__loading">加载中...</div>

        <template v-else>
          <div
            v-for="item in catalog"
            :key="item.topic.slug"
            class="catalog__topic"
          >
            <h2 class="catalog__topic-title">{{ item.topic.title }}</h2>

            <div
              v-for="ch in item.chapters"
              :key="ch.chapter.slug || ch.chapter.id"
              class="catalog__chapter"
            >
              <h3 class="catalog__chapter-title">{{ ch.chapter.title }}</h3>

              <ol class="catalog__lessons">
                <li
                  v-for="(lesson, idx) in ch.lessons"
                  :key="lesson.slug"
                  class="catalog__lesson"
                  :class="{ 'catalog__lesson--completed': getLessonState(lesson.slug).isCompleted }"
                >
                  <NuxtLink
                    :to="`/${item.topic.slug}/${lesson.slug}`"
                    class="catalog__lesson-link"
                  >
                    <span class="catalog__lesson-index">
                      <template v-if="getLessonState(lesson.slug).isCompleted">✓</template>
                      <template v-else>{{ String(idx + 1).padStart(2, '0') }}</template>
                    </span>
                    <span class="catalog__lesson-title">{{ lesson.title }}</span>
                    <span class="catalog__lesson-arrow">→</span>
                  </NuxtLink>
                </li>
              </ol>
            </div>
          </div>

          <div v-if="catalog.length === 0" class="catalog__empty">
            暂无课程内容
          </div>
        </template>
      </div>
    </section>
  </nav>
</template>

<script setup lang="ts">
/**
 * 课程目录页 - /courses
 *
 * 唯一的课程目录入口，直接展示：
 * Topic → Chapter → Lesson 完整层级。
 *
 * 用户点击 Lesson 后进入 /{topicSlug}/{lessonSlug} 学习页面。
 * 无中间页面（无 Topic Index、无 Course Index）。
 */
import { useLearningState } from '~/composables/useLearningState'

useHead({ title: '课程目录' })

const { catalog, loading } = await useCourseCatalog()

const { getLessonState } = useLearningState()
</script>

<style scoped>
.catalog__header {
  padding: var(--spacing-2xl) 0 var(--spacing-xl);
  text-align: center;
  background: linear-gradient(180deg, var(--color-bg-secondary), transparent);
}

.catalog__title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}

.catalog__desc {
  font-size: 1rem;
  color: var(--color-text-secondary);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.6;
}

.catalog__body {
  padding: var(--spacing-xl) 0 var(--spacing-3xl);
}

.catalog__loading {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-text-muted);
}

.catalog__empty {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-text-muted);
}

/* Topic 分组 */
.catalog__topic {
  margin-bottom: var(--spacing-3xl);
}

.catalog__topic-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-primary);
}

/* Chapter 分组 */
.catalog__chapter {
  margin-bottom: var(--spacing-xl);
}

.catalog__chapter-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-sm);
}

/* Lesson 列表 */
.catalog__lessons {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.catalog__lesson-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  color: inherit;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.catalog__lesson-link:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.catalog__lesson--completed .catalog__lesson-link {
  border-color: var(--color-success-border);
  background: var(--color-success-bg);
}

.catalog__lesson-index {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-primary);
  min-width: 2rem;
  text-align: center;
}

.catalog__lesson--completed .catalog__lesson-index {
  color: var(--color-success-dark);
}

.catalog__lesson-title {
  flex: 1;
  font-weight: 500;
  color: var(--color-text-primary);
}

.catalog__lesson-arrow {
  color: var(--color-text-light);
  font-weight: 500;
  transition: transform 150ms ease;
}

.catalog__lesson-link:hover .catalog__lesson-arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}
</style>
