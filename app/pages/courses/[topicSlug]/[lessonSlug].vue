<template>
  <article>
    <section class="lesson-page__body">
      <h1 class="lesson-page__title">
        {{ lessonData?.title }}
      </h1>

      <div class="lesson-page__content">
        <ContentRenderer
          v-if="lessonData?.content?.blocks?.length"
          :blocks="lessonData.content.blocks"
        />
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
/**
 * Lesson 页面 - 沉浸式课时学习
 *
 * 路由：/courses/:topicSlug/:lessonSlug
 *
 * 极简布局：仅显示课时标题和内容。
 * 内容渲染由 ContentRenderer 组件基于 Lesson AST 驱动（Block → Vue 组件）。
 *
 * 设计原则：
 * - 去除面包屑、返回链接和课程编号，保持专注
 * - 使用默认布局，显示全局 Header
 * - 进入页面时记录学习进度
 */
definePageMeta({
  layout: 'default'
})

import { useLearningState } from '~/composables/useLearningState'
import { useRouteParam } from '~/composables/useRouteParam'

const topicSlug = useRouteParam('topicSlug') ?? ''
const lessonSlug = (useRouteParam('lessonSlug') ?? '') as string

const { lesson, topic: topicData } = await useLessonPage(topicSlug, lessonSlug)

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
      totalLessons: 0
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
  padding: var(--spacing-xl) var(--spacing-lg);
}

.lesson-page__title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg);
}

.lesson-page__body {
  line-height: 1.8;
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .lesson-page__title {
    font-size: 1.375rem;
  }
}
</style>
