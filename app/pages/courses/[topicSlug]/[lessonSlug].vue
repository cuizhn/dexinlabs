<template>
  <article>
    <section class="body">
      <h1 class="title">
        {{ lessonData?.title }}
      </h1>

      <div class="content">
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
 */
import { useRouteParam } from '~/composables/useRouteParam'

definePageMeta({
  layout: 'default'
})

const topicSlug = useRouteParam('topicSlug') ?? ''
const lessonSlug = (useRouteParam('lessonSlug') ?? '') as string

const { lesson } = await useLessonPage(topicSlug, lessonSlug)

const lessonData = computed(() => lesson.value)

useHead({
  title: computed(() => lessonData.value?.title || '学习课时')
})
</script>

<style scoped>
article {
  justify-items: center;
  user-select: text;
  flex-grow: 1;
  background: var(--color-bg-white);
  padding: var(--spacing-xl) var(--spacing-lg);
}

.body {
  max-width: 760px;
  line-height: 1.8;
  color: var(--color-text-primary);
}

.title {
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg);
}

@media (max-width: 768px) {
  .title {
    font-size: var(--text-xl);
  }
}
</style>
