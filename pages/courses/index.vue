<template>
  <div class="courses-page">
    <section class="courses-page__header">
      <div class="container container-sm">
        <h1 class="courses-page__title">数学课程</h1>
        <p class="courses-page__description">
          从基础到高级，系统化的数学学习路径，帮助你建立完整的数学知识体系
        </p>
      </div>
    </section>

    <section class="courses-page__filters">
      <div class="container">
        <div class="courses-page__filter-list">
          <button
            v-for="filter in filters"
            :key="filter.value"
            class="courses-page__filter-btn"
            :class="{ 'courses-page__filter-btn--active': activeFilter === filter.value }"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
            <span class="courses-page__filter-count">{{ filter.count }}</span>
          </button>
        </div>
      </div>
    </section>

    <section class="courses-page__content">
      <div class="container">
        <div class="courses-page__grid">
          <CourseCard
            v-for="course in filteredCourses"
            :key="course.id"
            :course="course"
          />
        </div>
      </div>
    </section>

    <section v-if="filteredCourses.length === 0" class="courses-page__empty">
      <div class="container container-sm text-center">
        <p class="courses-page__empty-text">暂无符合条件的课程</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCourse } from '~/modules/course/useCourse.js'
import CourseCard from '~/components/course/CourseCard.vue'

useHead({ title: '课程中心' })

const { getAllCourses } = useCourse()
const courses = getAllCourses()

const filters = computed(() => {
  const counts = {
    all: courses.length,
    beginner: courses.filter(c => c.difficulty === 'beginner').length,
    intermediate: courses.filter(c => c.difficulty === 'intermediate').length,
    advanced: courses.filter(c => c.difficulty === 'advanced').length,
  }
  return [
    { label: '全部', value: 'all', count: counts.all },
    { label: '入门', value: 'beginner', count: counts.beginner },
    { label: '进阶', value: 'intermediate', count: counts.intermediate },
    { label: '高级', value: 'advanced', count: counts.advanced },
  ]
})

const activeFilter = ref('all')

const filteredCourses = computed(() => {
  if (activeFilter.value === 'all') return courses
  return courses.filter(course => course.difficulty === activeFilter.value)
})
</script>

<style scoped>
.courses-page { padding-bottom: var(--spacing-2xl); }
.courses-page__header { padding: var(--spacing-2xl) 0; background-color: var(--color-bg-secondary); text-align: center; }
.courses-page__title { font-size: 2.5rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--spacing-md); }
.courses-page__description { font-size: 1.125rem; color: var(--color-text-secondary); max-width: 600px; margin: 0 auto; }
.courses-page__filters { padding: var(--spacing-lg) 0; border-bottom: 1px solid var(--color-border); }
.courses-page__filter-list { display: flex; gap: var(--spacing-sm); flex-wrap: wrap; }
.courses-page__filter-btn { display: flex; align-items: center; gap: var(--spacing-xs); padding: var(--spacing-sm) var(--spacing-md); background-color: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); font-size: 0.875rem; font-weight: 500; color: var(--color-text-secondary); cursor: pointer; transition: all 0.2s ease; }
.courses-page__filter-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.courses-page__filter-btn--active { background-color: var(--color-primary); border-color: var(--color-primary); color: white; }
.courses-page__filter-count { background-color: rgba(0, 0, 0, 0.1); padding: 2px 8px; border-radius: var(--border-radius-sm); font-size: 0.75rem; }
.courses-page__filter-btn--active .courses-page__filter-count { background-color: rgba(255, 255, 255, 0.2); }
.courses-page__content { padding: var(--spacing-2xl) 0; }
.courses-page__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--spacing-xl); }
.courses-page__empty { padding: var(--spacing-2xl) 0; }
.courses-page__empty-text { color: var(--color-text-secondary); font-size: 1rem; text-align: center; }

@media (max-width: 768px) {
  .courses-page__title { font-size: 2rem; }
  .courses-page__description { font-size: 1rem; }
  .courses-page__grid { grid-template-columns: 1fr; gap: var(--spacing-lg); }
}
</style>
