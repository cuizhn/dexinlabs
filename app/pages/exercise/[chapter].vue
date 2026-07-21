<template>
  <div class="exercise-page">
    <section class="exercise-page__header">
      <div class="container">
        <nav class="exercise-page__breadcrumb">
          <NuxtLink to="/course" class="exercise-page__bc-link">课程中心</NuxtLink>

          <span class="exercise-page__bc-sep">/</span>

          <NuxtLink v-if="chapterSlug" :to="`/course/${chapterSlug}`" class="exercise-page__bc-link">
            {{ chapterTitle || '章节' }}
          </NuxtLink>

          <span class="exercise-page__bc-sep">/</span>

          <span class="exercise-page__bc-current">章节练习</span>
        </nav>

        <h1 class="exercise-page__title">
          {{ chapterTitle ? `${chapterTitle} · 练习` : '章节练习' }}
        </h1>

        <p class="exercise-page__desc">
          思考 → 尝试 → 提示 → 修正 → 理解 → 总结 → 迁移。让每一次练习都成为思维的生长。
        </p>
      </div>
    </section>

    <section class="exercise-page__body">
      <div class="container exercise-page__container">
        <div v-if="loading" class="exercise-page__empty">练习内容加载中...</div>

        <template v-else-if="exercise">
          <h2 class="exercise-page__section-title">{{ exercise.title || '练习题' }}</h2>

          <div v-if="exercise.description" class="exercise-page__intro">
            {{ exercise.description }}
          </div>

          <ContentRenderer v-if="exercise" :value="exercise" />
        </template>

        <div v-else class="exercise-page__placeholder">
          <div class="placeholder-card">
            <div class="placeholder-card__icon">✎</div>
            <h3 class="placeholder-card__title">练习内容准备中</h3>
            <p class="placeholder-card__desc"> 本章节的交互练习正在精心设计中。请先完成课时学习，扎实掌握每个概念。 </p>
            <NuxtLink v-if="chapterSlug" :to="`/course/${chapterSlug}`" class="placeholder-card__back">
              ← 返回章节页
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import ContentRenderer from '../../components/content/Renderer.vue'

const route = useRoute()
const chapterSlug = Array.isArray(route.params.chapter) ? route.params.chapter[0] : route.params.chapter

const { data: exerciseData, pending: loading } = await useFetch(
  () => `/api/exercise?chapter=${chapterSlug}`
)

const exercise = computed(() => {
  const list = exerciseData.value?.exercises
  if (Array.isArray(list) && list.length > 0) return list[0]
  return null
})

const chapterTitle = computed(() => exerciseData.value?.chapterTitle || '')

useHead({
  title: computed(() => (chapterTitle.value ? `${chapterTitle.value} · 练习` : '章节练习'))
})
</script>

<style scoped>
.exercise-page__header {
  padding: var(--spacing-xl) 0 var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-bg-secondary), transparent);
}
.exercise-page__breadcrumb {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
  font-size: 0.875rem;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}
.exercise-page__bc-link {
  color: var(--color-text-secondary);
  text-decoration: none;
}
.exercise-page__bc-link:hover {
  color: var(--color-primary);
}
.exercise-page__bc-sep {
  color: var(--color-text-light);
}
.exercise-page__bc-current {
  color: var(--color-text-primary);
  font-weight: 500;
}
.exercise-page__title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}
.exercise-page__desc {
  font-size: 1rem;
  color: var(--color-text-secondary);
  max-width: 640px;
  line-height: 1.6;
  margin: 0;
}
.exercise-page__body {
  padding: var(--spacing-xl) 0 var(--spacing-3xl);
}
.exercise-page__container {
  max-width: 760px;
}
.exercise-page__section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md);
}
.exercise-page__intro {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-left: 3px solid var(--color-primary);
  border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
}
.exercise-page__empty,
.exercise-page__placeholder {
  padding: var(--spacing-2xl) 0;
}
.placeholder-card {
  padding: var(--spacing-3xl) var(--spacing-xl);
  background: var(--color-bg-white);
  border: 1px dashed var(--color-border);
  border-radius: var(--border-radius-lg);
  text-align: center;
}
.placeholder-card__icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-md);
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.placeholder-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}
.placeholder-card__desc {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 440px;
  margin: 0 auto var(--spacing-lg);
}
.placeholder-card__back {
  display: inline-block;
  font-weight: 500;
  color: var(--color-primary);
  text-decoration: none;
}
.placeholder-card__back:hover {
  text-decoration: underline;
}
</style>
