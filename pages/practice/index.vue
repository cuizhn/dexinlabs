<template>
  <div class="practice-page">
    <section class="practice-page__header">
      <div class="container container-sm">
        <h1 class="practice-page__title">练习中心</h1>
        <p class="practice-page__description">选择课程，开始练习巩固所学知识</p>
      </div>
    </section>

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

useHead({ title: '练习中心' })

const { getExercises } = useExercise()
// 默认展示代数练习
const exercises = getExercises('algebra')
</script>

<style scoped>
.practice-page { padding-bottom: var(--spacing-2xl); }
.practice-page__header { padding: var(--spacing-2xl) 0; background-color: var(--color-bg-secondary); text-align: center; }
.practice-page__title { font-size: 2.5rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--spacing-md); }
.practice-page__description { font-size: 1.125rem; color: var(--color-text-secondary); max-width: 600px; margin: 0 auto; }
.practice-page__content { padding: var(--spacing-2xl) 0; }
.practice-page__grid { display: flex; flex-direction: column; gap: var(--spacing-lg); max-width: 720px; margin: 0 auto; }

@media (max-width: 768px) {
  .practice-page__title { font-size: 2rem; }
}
</style>
