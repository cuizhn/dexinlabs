<template>
  <div class="info-page">
    <section class="info-page__header">
      <div class="container">
        <span class="info-page__tag">同步学习</span>

        <h1 class="info-page__title">跟着节奏，稳步前行</h1>

        <p class="info-page__desc">
          与学校课程进度同步，课上学、课后练，让课堂内容真正吸收内化。 当前功能建设中，敬请期待。
        </p>
      </div>
    </section>

    <section class="info-page__body">
      <div class="container info-page__container">
        <div class="info-card">
          <div class="info-card__icon">📚</div>

          <h2 class="info-card__title">七年级 · 上学期</h2>

          <p class="info-card__desc">人教版 · 初中一年级同步课程</p>

          <NuxtLink to="/course" class="info-card__link">前往课程中心 →</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useHead } from 'nuxt/app'

useHead({ title: '同步学习' })
</script>

<style scoped>
.info-page__header {
  padding: var(--spacing-2xl) 0 var(--spacing-xl);
  text-align: center;
  background: linear-gradient(180deg, var(--color-bg-secondary), transparent);
}
.info-page__tag {
  display: inline-block;
  padding: 4px 14px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: 100px;
  margin-bottom: var(--spacing-md);
}
.info-page__title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}
.info-page__desc {
  font-size: 1rem;
  color: var(--color-text-secondary);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.6;
}
.info-page__body {
  padding: var(--spacing-xl) 0 var(--spacing-3xl);
}
.info-page__container {
  max-width: 800px;
}
.info-card {
  padding: var(--spacing-2xl);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  text-align: center;
}
.info-card__icon {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
}
.info-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs);
}
.info-card__desc {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-lg);
}
.info-card__link {
  font-weight: 500;
  color: var(--color-primary);
  text-decoration: none;
}
.info-card__link:hover {
  text-decoration: underline;
}
</style>
