<template>
  <div class="lesson-detail">
    <section class="lesson-detail__header">
      <div class="container lesson-detail__container">
        <nav class="lesson-detail__breadcrumb">
          <NuxtLink to="/map" class="lesson-detail__bc-link">知识地图</NuxtLink>
          <span class="lesson-detail__bc-sep">/</span>
          <NuxtLink
            v-if="topicSlug"
            :to="`/${domainSlug}/${topicSlug}`"
            class="lesson-detail__bc-link"
          >
            {{ topic?.title || '' }}
          </NuxtLink>
          <span class="lesson-detail__bc-sep">/</span>
          <span class="lesson-detail__bc-current">{{ lesson?.title || '学习' }}</span>
        </nav>
      </div>
    </section>

    <section class="lesson-detail__body">
      <div class="container lesson-detail__container">
        <div v-if="loading" class="lesson-detail__empty">内容加载中...</div>
        <ContentRenderer v-else-if="lesson" :value="lesson" />
        <div v-else class="lesson-detail__empty">内容未找到</div>

        <!-- 上一课 / 下一课导航 -->
        <nav v-if="previousLesson || nextLesson" class="lesson-detail__nav">
          <NuxtLink
            v-if="previousLesson"
            :to="`/${domainSlug}/${topicSlug}/${previousLesson.slug}`"
            class="lesson-detail__nav-link lesson-detail__nav-link--prev"
          >
            ← {{ previousLesson.title }}
          </NuxtLink>
          <span v-else />
          <NuxtLink
            v-if="nextLesson"
            :to="`/${domainSlug}/${topicSlug}/${nextLesson.slug}`"
            class="lesson-detail__nav-link lesson-detail__nav-link--next"
          >
            {{ nextLesson.title }} →
          </NuxtLink>
        </nav>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 课时详情页 - 展示单个课时的 Markdown 内容
 * 含面包屑导航和前后课时切换
 */
const lessonSlug = useRouteParam('lesson') ?? ''
const topicSlug = useRouteParam('topic') ?? ''
const domainSlug = useRouteParam('domain') ?? ''

const { lesson, topic, previousLesson, nextLesson, loading } = await useLessonPage(lessonSlug)

useHead({
  title: computed(() => {
    const parts = []
    if (lesson.value?.title) parts.push(lesson.value.title)
    if (topic.value?.title) parts.push(topic.value.title)
    return parts.join(' · ')
  })
})
</script>

<style scoped>
.lesson-detail__header {
  padding: var(--spacing-lg) 0;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}
.lesson-detail__container {
  max-width: 760px;
}
.lesson-detail__breadcrumb {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
  font-size: 0.875rem;
  flex-wrap: wrap;
}
.lesson-detail__bc-link {
  color: var(--color-text-secondary);
  text-decoration: none;
}
.lesson-detail__bc-link:hover {
  color: var(--color-primary);
}
.lesson-detail__bc-sep {
  color: var(--color-text-light);
}
.lesson-detail__bc-current {
  color: var(--color-text-primary);
  font-weight: 500;
}
.lesson-detail__body {
  padding: var(--spacing-2xl) 0 var(--spacing-3xl);
}
.lesson-detail__empty {
  padding: var(--spacing-3xl) 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}
.lesson-detail__nav {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
}
.lesson-detail__nav-link {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
  max-width: 45%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lesson-detail__nav-link:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}
.lesson-detail__nav-link--next {
  margin-left: auto;
}
</style>
