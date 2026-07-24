<template>
  <div class="lesson-page">
    <div class="lesson-page__container">
      <!-- 左侧：概念清单（固定） -->
      <aside class="lesson-page__sidebar">
        <LearningLessonChecklist />
      </aside>

      <!-- 中间：Markdown 内容（最大阅读区域） -->
      <main class="lesson-page__main">
        <article class="lesson-page__article">
          <header class="lesson-page__header">
            <!-- 仅保留返回 Topic 的链接，不显示面包屑 -->
            <NuxtLink :to="`/${route.params.domain}/${route.params.topic}`" class="lesson-page__back">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 13l-3-3 3-3M7 10h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ data?.topic?.title }}
            </NuxtLink>
            <div class="lesson-page__meta">
              <span class="lesson-page__order">第 {{ data?.lesson?.order }} 课</span>
            </div>
          </header>

          <h1 class="lesson-page__title">{{ data?.lesson?.title }}</h1>

          <div v-if="data?.lesson?.introHtml" class="lesson-page__intro" v-html="data.lesson.introHtml"></div>

          <div class="lesson-page__body" v-html="data?.lesson?.bodyHtml"></div>

          <div v-if="data?.lesson?.summaryHtml" class="lesson-page__summary" v-html="data.lesson.summaryHtml"></div>

          <!-- 课时导航（上一课/下一课） -->
          <nav class="lesson-page__nav">
            <NuxtLink
              v-if="data?.previousLesson"
              :to="`/${route.params.domain}/${route.params.topic}/${data.previousLesson.slug}`"
              class="lesson-page__nav-btn lesson-page__nav-btn--prev"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 13l-3-3 3-3M7 10h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>{{ data.previousLesson.title }}</span>
            </NuxtLink>

            <NuxtLink
              v-if="data?.nextLesson"
              :to="`/${route.params.domain}/${route.params.topic}/${data.nextLesson.slug}`"
              class="lesson-page__nav-btn lesson-page__nav-btn--next"
            >
              <span>{{ data.nextLesson.title }}</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M6 10h8M10 6l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </NuxtLink>
          </nav>
        </article>
      </main>

      <!-- 右侧：学习辅助面板（预留） -->
      <aside class="lesson-page__assistant">
        <LearningLessonAssistant />
        <LearningMyUnderstanding :lesson-slug="lessonSlug" />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Lesson 页面 - 沉浸式学习体验
 *
 * 三栏布局：
 * - 左侧：概念清单（今天需要解决的问题）
 * - 中间：Markdown 正文（最大阅读区域）
 * - 右侧：学习助手（提示、相关知识、诊断提醒）
 * - 右下角：我的理解（反思笔记）
 *
 * 设计原则：
 * - 去除面包屑和顶部导航，保持沉浸
 * - 仅保留返回 Topic 的链接
 * - 进入页面时记录学习进度
 */
import { useLearningState } from '~/composables/useLearningState'

const route = useRoute()
const lessonSlug = route.params.lesson as string
const topicSlug = route.params.topic as string
const domainSlug = route.params.domain as string

/** 使用 useLessonPage composable 获取课时数据 */
const { lesson, topic, previousLesson, nextLesson } = await useLessonPage(lessonSlug)

/** 构造 useLessonPage 返回的数据结构（兼容模板中的 data 引用） */
const data = computed(() => {
  if (!lesson.value) return null
  return {
    lesson: lesson.value,
    topic: topic.value,
    previousLesson: previousLesson.value,
    nextLesson: nextLesson.value
  }
})

/** 记录学习进度 */
const { recordLesson } = useLearningState()

onMounted(() => {
  if (topic.value && lesson.value) {
    recordLesson({
      topicSlug: domainSlug,
      topicTitle: topic.value.title,
      lessonSlug: lessonSlug,
      lessonTitle: lesson.value.title,
      lessonIndex: lesson.value.order,
      totalLessons: 0 // 当前无法获取总数，未来由 Progress Engine 提供
    })
  }
})

useHead({
  title: computed(() => data.value?.lesson.title || '学习课时')
})
</script>

<style scoped>
.lesson-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.lesson-page__container {
  display: grid;
  grid-template-columns: 280px 1fr 280px;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl) var(--spacing-lg);
  max-width: 1600px;
  margin: 0 auto;
}

.lesson-page__sidebar {
  position: sticky;
  top: calc(var(--spacing-xl) + 64px);
  height: fit-content;
}

.lesson-page__main {
  min-width: 0;
}

.lesson-page__article {
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-2xl);
}

.lesson-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.lesson-page__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 150ms ease;
}

.lesson-page__back:hover {
  color: var(--color-primary);
}

.lesson-page__meta {
  display: flex;
  gap: var(--spacing-md);
}

.lesson-page__order {
  font-size: 0.875rem;
  color: var(--color-text-light);
  padding: 4px 12px;
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius-md);
}

.lesson-page__title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg);
}

.lesson-page__intro {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
}

.lesson-page__body {
  line-height: 1.8;
  color: var(--color-text-primary);
}

.lesson-page__body h2 {
  font-size: 1.375rem;
  font-weight: 700;
  margin: var(--spacing-xl) 0 var(--spacing-lg);
  color: var(--color-text-primary);
}

.lesson-page__body h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: var(--spacing-lg) 0 var(--spacing-md);
  color: var(--color-text-primary);
}

.lesson-page__body p {
  margin: var(--spacing-md) 0;
}

.lesson-page__body ul,
.lesson-page__body ol {
  padding-left: var(--spacing-xl);
  margin: var(--spacing-md) 0;
}

.lesson-page__body li {
  margin: var(--spacing-sm) 0;
}

.lesson-page__body code {
  background: var(--color-bg-secondary);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875em;
}

.lesson-page__body pre {
  background: var(--color-bg-secondary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  overflow-x: auto;
  margin: var(--spacing-lg) 0;
}

.lesson-page__body pre code {
  background: none;
  padding: 0;
}

.lesson-page__summary {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
}

.lesson-page__nav {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
}

.lesson-page__nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  font-size: 0.9375rem;
  text-decoration: none;
  transition: all 0.25s ease;
}

.lesson-page__nav-btn--prev {
  color: var(--color-text-secondary);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
}

.lesson-page__nav-btn--prev:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.lesson-page__nav-btn--next {
  color: #fff;
  background: linear-gradient(135deg, var(--color-primary), #6366f1);
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
}

.lesson-page__nav-btn--next:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4);
}

.lesson-page__assistant {
  position: sticky;
  top: calc(var(--spacing-xl) + 64px);
  height: fit-content;
}

@media (max-width: 1200px) {
  .lesson-page__container {
    grid-template-columns: 240px 1fr;
  }

  .lesson-page__assistant {
    display: none;
  }
}

@media (max-width: 768px) {
  .lesson-page__container {
    grid-template-columns: 1fr;
    padding: var(--spacing-lg);
  }

  .lesson-page__sidebar {
    display: none;
  }

  .lesson-page__article {
    padding: var(--spacing-xl);
  }

  .lesson-page__title {
    font-size: 1.375rem;
  }

  .lesson-page__nav {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .lesson-page__nav-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
