<template>
  <div class="course-index">
    <section class="course-index__header">
      <div class="container">
        <span class="course-index__tag">课程中心</span>
        <h1 class="course-index__title">探索数学的旅程</h1>
        <p class="course-index__subtitle"> 每一个章节都是精心设计的学习单元，从理解到应用，让你真正得心应手 </p>
        
      </div>
    </section>

    <section class="course-index__body">
      <div class="container">
        <template v-if="chapters.length">
          <div class="course-index__grid">
            <NuxtLink v-for="c in chapters" :key="c.id" :to="`/course/${c.slug}`" class="chapter-card">
              <div class="chapter-card__order">
                {{ String(c.order).padStart(2, '0') }}
              </div>

              <h2 class="chapter-card__title">{{ c.title }}</h2>

              <p v-if="c.description" class="chapter-card__desc">
                {{ c.description }}
              </p>

              <div class="chapter-card__footer">
                <span class="chapter-card__cta">进入学习 →</span>
              </div>
            </NuxtLink>
          </div>
        </template>
      </div>
    </section>
    
  </div>
</template>

<script setup>
import { useHead } from 'nuxt/app'

useHead({ title: '课程中心' })

const { chapters } = await useChapter()
</script>

<style scoped>
.course-index__header {
  padding: var(--spacing-2xl) 0 var(--spacing-xl);
  text-align: center;
  background: linear-gradient(180deg, var(--color-bg-secondary), transparent);
}
.course-index__tag {
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
.course-index__title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}
.course-index__subtitle {
  font-size: 1rem;
  color: var(--color-text-secondary);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.6;
}
.course-index__body {
  padding: var(--spacing-xl) 0 var(--spacing-3xl);
}
.course-index__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}
.chapter-card {
  display: block;
  padding: var(--spacing-xl);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  text-decoration: none;
  color: inherit;
  transition:
    transform 150ms ease,
    box-shadow 150ms ease,
    border-color 150ms ease;
}
.chapter-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}
.chapter-card__order {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}
.chapter-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
  line-height: 1.4;
}
.chapter-card__desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 var(--spacing-lg);
  min-height: 3em;
}
.chapter-card__footer {
  border-top: 1px dashed var(--color-border);
  padding-top: var(--spacing-md);
}
.chapter-card__cta {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-primary);
}
.course-index__empty {
  padding: var(--spacing-3xl) 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}
</style>
