<!-- 页面路径: /courses -->
<!-- 课程列表页：包含页面头部、难度筛选栏和课程卡片网格 -->
<template>
  <div class="courses-page">
    <!-- 页面头部：标题和描述 -->
    <section class="courses-page__header">
      <div class="container container-sm">
        <h1 class="courses-page__title">数学课程</h1>
        <p class="courses-page__description">
          从基础到高级，系统化的数学学习路径，帮助你建立完整的数学知识体系
        </p>
      </div>
    </section>

    <!-- 筛选栏：按难度筛选课程（全部/入门/进阶/高级） -->
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

    <!-- 课程内容区：展示筛选后的课程卡片网格 -->
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

    <!-- 空状态：筛选后无课程时显示提示 -->
    <section v-if="filteredCourses.length === 0" class="courses-page__empty">
      <div class="container container-sm text-center">
        <p class="courses-page__empty-text">暂无符合条件的课程</p>
      </div>
    </section>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useCourse } from '~/composables/course/useCourse'
import CourseCard from '~/components/course/CourseCard.vue'

useHead({
  title: '课程中心'
})

const { getAllCourses } = useCourse()

const { data: courses } =
  await useAsyncData(
    'courses',
    () => getAllCourses()
  )

const activeFilter = ref('all')

const filters = computed(() => {

  const list = courses.value || []

  const counts = {
    all: list.length,
    beginner: list.filter(
      c => c.difficulty === 'beginner'
    ).length,
    intermediate: list.filter(
      c => c.difficulty === 'intermediate'
    ).length,
    advanced: list.filter(
      c => c.difficulty === 'advanced'
    ).length
  }

  return [
    {
      label: '全部',
      value: 'all',
      count: counts.all
    },
    {
      label: '入门',
      value: 'beginner',
      count: counts.beginner
    },
    {
      label: '进阶',
      value: 'intermediate',
      count: counts.intermediate
    },
    {
      label: '高级',
      value: 'advanced',
      count: counts.advanced
    }
  ]
})

const filteredCourses = computed(() => {

  const list = courses.value || []

  if (activeFilter.value === 'all') {
    return list
  }

  return list.filter(
    course =>
      course.difficulty ===
      activeFilter.value
  )
})
</script>

<style scoped>
/* ==================== 页面布局 ==================== */
/* 页面根容器 */
.courses-page { padding-bottom: var(--spacing-2xl); }
/* 页面头部：灰色背景，居中文字 */
.courses-page__header { padding: var(--spacing-2xl) 0; background-color: var(--color-bg-secondary); text-align: center; }
/* 页面标题 */
.courses-page__title { font-size: 2.5rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--spacing-md); }
/* 页面描述 */
.courses-page__description { font-size: 1.125rem; color: var(--color-text-secondary); max-width: 600px; margin: 0 auto; }

/* ==================== 筛选栏 ==================== */
/* 筛选栏：底部带分隔线 */
.courses-page__filters { padding: var(--spacing-lg) 0; border-bottom: 1px solid var(--color-border); }
/* 筛选按钮列表：横向排列，自动换行 */
.courses-page__filter-list { display: flex; gap: var(--spacing-sm); flex-wrap: wrap; }
/* 筛选按钮：带数量角标 */
.courses-page__filter-btn { display: flex; align-items: center; gap: var(--spacing-xs); padding: var(--spacing-sm) var(--spacing-md); background-color: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); font-size: 0.875rem; font-weight: 500; color: var(--color-text-secondary); cursor: pointer; transition: all 0.2s ease; }
/* 筛选按钮悬停 */
.courses-page__filter-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
/* 激活状态筛选按钮：主色背景 */
.courses-page__filter-btn--active { background-color: var(--color-primary); border-color: var(--color-primary); color: white; }
/* 筛选按钮数量角标 */
.courses-page__filter-count { background-color: rgba(0, 0, 0, 0.1); padding: 2px 8px; border-radius: var(--border-radius-sm); font-size: 0.75rem; }
/* 激活状态下数量角标：半透明白色背景 */
.courses-page__filter-btn--active .courses-page__filter-count { background-color: rgba(255, 255, 255, 0.2); }

/* ==================== 课程内容区 ==================== */
/* 内容区域 */
.courses-page__content { padding: var(--spacing-2xl) 0; }
/* 课程卡片网格：自适应列数，最小宽度320px */
.courses-page__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--spacing-xl); }

/* ==================== 空状态 ==================== */
.courses-page__empty { padding: var(--spacing-2xl) 0; }
.courses-page__empty-text { color: var(--color-text-secondary); font-size: 1rem; text-align: center; }

/* ==================== 响应式适配 ==================== */
/* 手机端：缩小标题字号，单列布局 */
@media (max-width: 768px) {
  .courses-page__title { font-size: 2rem; }
  .courses-page__description { font-size: 1rem; }
  .courses-page__grid { grid-template-columns: 1fr; gap: var(--spacing-lg); }
}
</style>
