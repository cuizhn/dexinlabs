<!-- 页面路径: /courses -->
<!-- 课程列表页：展示所有课程，支持按难度筛选 -->
<template>
  <div class="courses-page">
    <!-- 页面头部 -->
    <section class="courses-page__header">
      <div class="container container-sm">
        <h1 class="courses-page__title">数学课程</h1>
        <p class="courses-page__description">
          从基础到高级，系统化的数学学习路径
        </p>
      </div>
    </section>

    <!-- 筛选栏 -->
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

    <!-- 课程网格 -->
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

    <!-- 空状态 -->
    <section v-if="filteredCourses.length === 0" class="courses-page__empty">
      <div class="container container-sm text-center">
        <p>暂无符合条件的课程</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCourse } from '~/composables/course/useCourse'
import CourseCard from '~/components/course/CourseCard.vue'

useHead({ title: '课程中心' })

const { getAllCourses } = useCourse()
const { data: courses } = await useAsyncData('courses', () => getAllCourses())

const activeFilter = ref('all')

const filters = computed(() => {
  const list = courses.value || []
  const counts = {
    all: list.length,
    beginner: list.filter(c => c.difficulty === 'beginner').length,
    intermediate: list.filter(c => c.difficulty === 'intermediate').length,
    advanced: list.filter(c => c.difficulty === 'advanced').length,
  }
  return [
    { label: '全部', value: 'all', count: counts.all },
    { label: '入门', value: 'beginner', count: counts.beginner },
    { label: '进阶', value: 'intermediate', count: counts.intermediate },
    { label: '高级', value: 'advanced', count: counts.advanced },
  ]
})

const filteredCourses = computed(() => {
  const list = courses.value || []
  if (activeFilter.value === 'all') return list
  return list.filter(course => course.difficulty === activeFilter.value)
})
</script>

<style scoped>
.courses-page { padding-bottom: var(--spacing-2xl); }
.courses-page__header { padding: var(--spacing-2xl) 0; background-color: var(--color-bg-secondary); text-align: center; }
.courses-page__title { font-size: 2.5rem; font-weight: 700; margin-bottom: var(--spacing-md); }
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
.courses-page__empty { padding: var(--spacing-2xl) 0; text-align: center; }

@media (max-width: 768px) {
  .courses-page__title { font-size: 2rem; }
  .courses-page__description { font-size: 1rem; }
  .courses-page__grid { grid-template-columns: 1fr; gap: var(--spacing-lg); }
}
</style>
