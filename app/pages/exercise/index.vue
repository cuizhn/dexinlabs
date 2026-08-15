<template>
  <section class="page">
    <section class="header">
      <div class="container">
        <nav class="breadcrumb">
          <NuxtLink to="/courses" class="bc-link">课程地图</NuxtLink>

          <span class="bc-sep">/</span>

          <span class="bc-current">练习</span>
        </nav>

        <h1 class="title">
          {{ topicTitle ? `${topicTitle} · 练习` : '练习' }}
        </h1>

        <p class="desc">
          思考 → 尝试 → 提示 → 修正 → 理解 → 总结 → 迁移。让每一次练习都成为思维的生长。
        </p>
      </div>
    </section>

    <section class="body">
      <div class="container body-container">
        <div v-if="loading" class="empty">练习内容加载中...</div>

        <template v-else-if="exercise">
          <h2 class="section-title">{{ exercise.title || '练习题' }}</h2>

          <p v-if="exercise.summary" class="intro">
            {{ exercise.summary }}
          </p>

          <ContentRenderer
            v-if="exerciseBlocks.length"
            :blocks="exerciseBlocks"
          />
        </template>

        <div v-else class="placeholder">
          <p class="placeholder-title">练习内容准备中</p>
          <p class="placeholder-desc">练习正在精心设计中。请先完成课时学习，扎实掌握每个概念。</p>
          <NuxtLink to="/courses" class="placeholder-back">
            ← 返回课程地图
          </NuxtLink>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
/**
 * 练习页 - 通过查询参数 ?topic=xxx 获取对应主题的练习题
 * Exercise 不绑定 Topic URL，保持统一入口
 *
 * 视觉：与首页共享设计系统（黑白灰、结构线、少卡片）。
 */
const route = useRoute()
const topicSlug = computed(() => typeof route.query.topic === 'string' ? route.query.topic : '')

const { exercise, topicTitle, exerciseBlocks, loading } = await useExercisePage(() => topicSlug.value)

useHead({
  title: computed(() => (topicTitle.value ? `${topicTitle.value} · 练习` : '练习'))
})
</script>

<style scoped>
.page {
  width: 100%;
  padding-inline: var(--spacing-lg);
}

.container {
  max-width: 860px;
  margin-inline: auto;
}

.header {
  padding: var(--spacing-2xl) 0 var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
}

.breadcrumb {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.bc-link {
  color: var(--color-text-secondary);
  text-decoration: none;
}

.bc-link:hover {
  color: var(--color-text-primary);
}

.bc-sep {
  color: var(--color-text-muted);
}

.bc-current {
  color: var(--color-text-primary);
  font-weight: 500;
}

.title {
  font-size: clamp(1.5rem, 3.5vw, 2rem);
  font-weight: 600;
  letter-spacing: -0.015em;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}

.desc {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  max-width: 640px;
  line-height: 1.7;
  margin: 0;
}

.body {
  padding: var(--spacing-xl) 0 var(--spacing-3xl);
}

.body-container {
  max-width: 720px;
}

.section-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md);
}

/* 简介：结构线分节，不做彩色引用条 */
.intro {
  padding: var(--spacing-md) 0;
  border-top: 1px solid var(--color-border-light);
  border-bottom: 1px solid var(--color-border-light);
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin-bottom: var(--spacing-lg);
}

.empty,
.placeholder {
  padding: var(--spacing-3xl) 0;
  text-align: center;
  color: var(--color-text-muted);
}

.placeholder-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}

.placeholder-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.7;
  max-width: 440px;
  margin: 0 auto var(--spacing-lg);
}

.placeholder-back {
  display: inline-block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  text-decoration: none;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--color-border);
  transition: color 0.15s ease, border-color 0.15s ease;
}

.placeholder-back:hover {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

@media (max-width: 768px) {
  .page {
    padding-inline: var(--spacing-md);
  }
}
</style>
