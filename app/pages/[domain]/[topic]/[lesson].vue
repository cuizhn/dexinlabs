<template>
  <article>
    <header>
      <NuxtLink :to="`/${domain}/${topic}`" class="lesson-page__back">
        <IconChevron direction="left" :size="20" />
        {{ topicData?.title }}
      </NuxtLink>
      <div class="lesson-page__meta">
        <span class="lesson-page__order">第 {{ lessonData?.order }} 课</span>
      </div>
    </header>

   <section class="lesson-page__body">
  <h1 class="lesson-page__title">
    {{ lessonData?.title }}
  </h1>

  <div class="lesson-page__content">
    <ContentRenderer
      v-if="lessonData?.bodyHtml"
      :html="lessonData.bodyHtml"
    />
  </div>
</section>

    
  </article>
</template>

<script setup lang="ts">
/**
 * Lesson 页面 - 沉浸式课时学习
 *
 * 单栏布局：返回链接 + 课时正文 + 前后导航。
 * Markdown 渲染与排版样式由 ContentRenderer 组件负责。
 *
 * 设计原则：
 * - 去除面包屑和顶部导航，保持沉浸
 * - 仅保留返回 Topic 的链接
 * - 进入页面时记录学习进度
 */
import { useLearningState } from '~/composables/useLearningState'
import { useRouteParam } from '~/composables/useRouteParam'

const domain = useRouteParam('domain')
const topic = useRouteParam('topic')
const lessonSlug = useRouteParam('lesson') as string

const { lesson, topic: topicData, bodyHtml } = await useLessonPage(lessonSlug)

/** 便捷别名，避免模板中频繁 .value 访问 */
const lessonData = computed(() => lesson.value)

/** 记录学习进度 */
const { recordLesson } = useLearningState()

onMounted(() => {
  if (topicData.value && lesson.value) {
    recordLesson({
      topicSlug: topicData.value!.slug,
      topicTitle: topicData.value.title,
      lessonSlug: lessonSlug!,
      lessonTitle: lesson.value.title,
      lessonIndex: lesson.value.order,
      totalLessons: 0 // 当前无法获取总数，未来由 Progress Engine 提供
    })
  }
})

useHead({
  title: computed(() => lessonData.value?.title || '学习课时')
})
</script>

<style scoped>
article {
  margin: 0 auto;
  max-width: 760px;
  user-select: text;
  flex-grow: 1;
  background: var(--color-bg-white);
}

header {
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
  font-size: var(--text-sm);
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

.lesson-page__body {
  line-height: 1.8;
  padding: var(--spacing-xl);
  box-sizing: border-box;
  color: var(--color-text-primary);
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
  color: var(--color-bg-white);
  background: linear-gradient(135deg, var(--color-primary), #6366f1);
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
}

.lesson-page__nav-btn--next:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4);
}

@media (max-width: 768px) {
  .lesson-page__title {
    font-size: 1.375rem;
  }

  footer {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .lesson-page__nav-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
