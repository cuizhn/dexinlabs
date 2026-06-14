<template>
  <div class="knowledge-page">
    <section class="knowledge-page__header">
      <div class="container container-sm">
        <h1 class="knowledge-page__title">知识图谱</h1>
        <p class="knowledge-page__description">可视化展示知识点之间的关联关系</p>
      </div>
    </section>

    <section class="knowledge-page__content">
      <div class="container container-sm text-center">
        <div class="knowledge-page__placeholder">
          <div class="knowledge-page__placeholder-icon">🗺️</div>
          <h2 class="knowledge-page__placeholder-title">功能开发中</h2>
          <p class="knowledge-page__placeholder-desc">知识图谱功能正在规划中，敬请期待</p>
          <NuxtLink to="/courses" class="btn btn--primary">浏览课程</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useHead({ title: '知识图谱' })
</script>

<style scoped>
.knowledge-page { padding-bottom: var(--spacing-2xl); }
.knowledge-page__header { padding: var(--spacing-2xl) 0; background-color: var(--color-bg-secondary); text-align: center; }
.knowledge-page__title { font-size: 2.5rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--spacing-md); }
.knowledge-page__description { font-size: 1.125rem; color: var(--color-text-secondary); max-width: 600px; margin: 0 auto; }
.knowledge-page__content { padding: var(--spacing-2xl) 0; }
.knowledge-page__placeholder { padding: var(--spacing-2xl); }
.knowledge-page__placeholder-icon { font-size: 4rem; margin-bottom: var(--spacing-lg); }
.knowledge-page__placeholder-title { font-size: 1.5rem; font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--spacing-sm); }
.knowledge-page__placeholder-desc { color: var(--color-text-secondary); margin-bottom: var(--spacing-xl); }

@media (max-width: 768px) {
  .knowledge-page__title { font-size: 2rem; }
}
</style>
