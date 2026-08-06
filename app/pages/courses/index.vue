<template>
  <nav class="courses-map">
    <header class="courses-map__header">
      <div class="container">
        <h1 class="courses-map__title">课程知识地图</h1>
        <p class="courses-map__desc">
          浏览完整的知识体系，找到你想学习的主题
        </p>
      </div>
    </header>

    <section class="courses-map__body">
      <div class="container">
        <div v-if="loading" class="courses-map__loading">加载中...</div>

        <div v-else class="courses-map__grid">
          <template v-for="cp in courses" :key="cp.course.slug">
            <h2
              v-if="cp.topics.length > 0 && courses.length > 1"
              class="courses-map__group-title"
            >
              {{ cp.course.title }}
            </h2>

            <LearningTopicStatusCard
              v-for="t in cp.topics"
              :key="t.slug"
              :topic="t"
              :total-lessons="0"
            />
          </template>
        </div>

        <div v-if="!loading && allTopics.length === 0" class="courses-map__empty">
          暂无学习主题
        </div>
      </div>
    </section>
  </nav>
</template>

<script setup lang="ts">
/**
 * 课程知识地图页 - /courses
 *
 * 统一课程入口，承担知识地图功能。
 * 直接展示 Topic 卡片，每个卡片显示标题、简介、学习状态。
 *
 * 架构 V4：Course → Topic → Chapter → Lesson
 */
useHead({ title: '课程知识地图' })

const { courses, loading } = await useCoursePage()

/** 将 CoursePage[] 展平为 Topic 列表（用于计算总数） */
const allTopics = computed(() => courses.value.flatMap(cp => cp.topics || []))
</script>

<style scoped>
.courses-map__header {
  padding: var(--spacing-2xl) 0 var(--spacing-xl);
  text-align: center;
  background: linear-gradient(180deg, var(--color-bg-secondary), transparent);
}

.courses-map__title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}

.courses-map__desc {
  font-size: 1rem;
  color: var(--color-text-secondary);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.6;
}

.courses-map__body {
  padding: var(--spacing-xl) 0 var(--spacing-3xl);
}

.courses-map__loading {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-text-muted);
}

.courses-map__empty {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-text-muted);
}

.courses-map__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  align-content: start;
}

.courses-map__group-title {
  grid-column: 1 / -1;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  padding: var(--spacing-md) 0 var(--spacing-xs);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--spacing-xs);
}

.courses-map__group-title:first-child {
  padding-top: 0;
}
</style>
