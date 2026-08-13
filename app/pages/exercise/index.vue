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

          <div v-if="exercise.summary" class="intro">
            {{ exercise.summary }}
          </div>

          <ContentRenderer
            v-if="exerciseBlocks.length"
            :blocks="exerciseBlocks"
          />
        </template>

        <div v-else class="placeholder">
          <div class="placeholder-card">
            <div class="placeholder-icon">✎</div>
            <h3 class="placeholder-title">练习内容准备中</h3>
            <p class="placeholder-desc"> 练习正在精心设计中。请先完成课时学习，扎实掌握每个概念。 </p>
            <NuxtLink to="/courses" class="placeholder-back">
              ← 返回课程地图
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
/**
 * 练习页 - 通过查询参数 ?topic=xxx 获取对应主题的练习题
 * Exercise 不绑定 Topic URL，保持统一入口
 */
const route = useRoute()
const topicSlug = computed(() => typeof route.query.topic === 'string' ? route.query.topic : '')

const { exercise, topicTitle, exerciseBlocks, loading } = await useExercisePage(() => topicSlug.value)

useHead({
  title: computed(() => (topicTitle.value ? `${topicTitle.value} · 练习` : '练习'))
})
</script>

<style scoped>
.header {
  padding: var(--spacing-xl) 0 var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-bg-secondary), transparent);
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
  color: var(--color-primary);
}

.bc-sep {
  color: var(--color-text-light);
}

.bc-current {
  color: var(--color-text-primary);
  font-weight: 500;
}

.title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}

.desc {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  max-width: 640px;
  line-height: 1.6;
  margin: 0;
}

.body {
  padding: var(--spacing-xl) 0 var(--spacing-3xl);
}

.body-container {
  max-width: 760px;
}

.section-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md);
}

.intro {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-left: 3px solid var(--color-primary);
  border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
}

.empty,
.placeholder {
  padding: var(--spacing-2xl) 0;
}

.placeholder-card {
  padding: var(--spacing-3xl) var(--spacing-xl);
  background: var(--color-bg-white);
  border: 1px dashed var(--color-border);
  border-radius: var(--border-radius-lg);
  text-align: center;
}

.placeholder-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-md);
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: var(--text-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
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
  line-height: 1.6;
  max-width: 440px;
  margin: 0 auto var(--spacing-lg);
}

.placeholder-back {
  display: inline-block;
  font-weight: 500;
  color: var(--color-primary);
  text-decoration: none;
}

.placeholder-back:hover {
  text-decoration: underline;
}
</style>
