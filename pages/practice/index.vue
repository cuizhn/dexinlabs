<!-- 页面路径: /practice -->
<!-- 练习中心页：展示选择题和填空题，默认加载代数练习 -->
<template>
  <div class="practice-page">
    <!-- 页面头部：标题和描述 -->
    <section class="practice-page__header">
      <div class="container container-sm">
        <h1 class="practice-page__title">练习中心</h1>
        <p class="practice-page__description">选择课程，开始练习巩固所学知识</p>
      </div>
    </section>

    <!-- 练习内容区：根据题型渲染不同的练习组件（选择题/填空题） -->
    <section class="practice-page__content">
      <div class="container">
        <div class="practice-page__grid">
          <div v-for="exercise in exercises" :key="exercise.id" class="practice-page__item">
            <QuizChoice
              v-if="exercise.type === 'choice'"
              :question="exercise.question"
              :options="exercise.options"
              :correct-index="exercise.correctIndex"
            />
            <QuizInput
              v-else-if="exercise.type === 'input'"
              :question="exercise.question"
              :correct-answer="exercise.correctAnswer"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useExercise } from '~/modules/exercise/useExercise.js'
import QuizChoice from '~/components/exercise/QuizChoice.vue'
import QuizInput from '~/components/exercise/QuizInput.vue'

// 设置页面标题
useHead({ title: '练习中心' })

// 获取练习数据方法
const { getExercises } = useExercise()
// 默认展示代数练习（algebra）
const exercises = getExercises('algebra')
</script>

<style scoped>
/* ==================== 页面布局 ==================== */
/* 页面根容器 */
.practice-page { padding-bottom: var(--spacing-2xl); }
/* 页面头部：灰色背景，居中文字 */
.practice-page__header { padding: var(--spacing-2xl) 0; background-color: var(--color-bg-secondary); text-align: center; }
/* 页面标题 */
.practice-page__title { font-size: 2.5rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--spacing-md); }
/* 页面描述 */
.practice-page__description { font-size: 1.125rem; color: var(--color-text-secondary); max-width: 600px; margin: 0 auto; }

/* ==================== 练习内容区 ==================== */
/* 内容区域 */
.practice-page__content { padding: var(--spacing-2xl) 0; }
/* 练习题列表：纵向排列，最大宽度720px居中 */
.practice-page__grid { display: flex; flex-direction: column; gap: var(--spacing-lg); max-width: 720px; margin: 0 auto; }

/* ==================== 响应式适配 ==================== */
/* 手机端：缩小标题字号 */
@media (max-width: 768px) {
  .practice-page__title { font-size: 2rem; }
}
</style>
