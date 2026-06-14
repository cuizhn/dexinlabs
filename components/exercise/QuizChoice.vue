<template>
  <!-- 选择题组件 -->
  <div class="quiz-choice">
    <p class="quiz-choice__question">{{ question }}</p>
    <div class="quiz-choice__options">
      <button
        v-for="(option, index) in options"
        :key="index"
        class="quiz-choice__option"
        :class="{
          'quiz-choice__option--selected': selected === index,
          'quiz-choice__option--correct': answered && index === correctIndex,
          'quiz-choice__option--wrong': answered && selected === index && index !== correctIndex,
        }"
        @click="selectOption(index)"
        :disabled="answered"
      >
        <span class="quiz-choice__label">{{ optionLabels[index] }}</span>
        <span class="quiz-choice__text">{{ option }}</span>
      </button>
    </div>
    <button
      v-if="selected !== null && !answered"
      class="quiz-choice__submit btn btn--primary"
      @click="submitAnswer"
    >
      提交答案
    </button>
    <div v-if="answered" class="quiz-choice__feedback" :class="isCorrect ? 'quiz-choice__feedback--correct' : 'quiz-choice__feedback--wrong'">
      {{ isCorrect ? '回答正确！' : '回答错误，正确答案是 ' + optionLabels[correctIndex] }}
    </div>
  </div>
</template>

<script setup>
// 选择题组件：支持单选、提交判题、反馈
import { ref, computed } from 'vue'

const props = defineProps({
  question: { type: String, required: true },
  options: { type: Array, required: true },
  correctIndex: { type: Number, required: true },
})

const selected = ref(null)
const answered = ref(false)

const optionLabels = ['A', 'B', 'C', 'D']

const isCorrect = computed(() => selected.value === props.correctIndex)

function selectOption(index) {
  if (!answered.value) {
    selected.value = index
  }
}

function submitAnswer() {
  answered.value = true
}
</script>

<style scoped>
.quiz-choice {
  padding: var(--spacing-lg);
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
}

.quiz-choice__question {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.quiz-choice__options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.quiz-choice__option {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  text-align: left;
  transition: all 0.2s ease;
}

.quiz-choice__option:hover:not(:disabled) {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.quiz-choice__option--selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.quiz-choice__option--correct {
  border-color: var(--color-success);
  background-color: #ECFDF5;
}

.quiz-choice__option--wrong {
  border-color: var(--color-error);
  background-color: #FEF2F2;
}

.quiz-choice__label {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--color-bg-secondary);
  font-size: var(--text-sm);
  font-weight: 600;
  flex-shrink: 0;
}

.quiz-choice__option--selected .quiz-choice__label {
  background-color: var(--color-primary);
  color: #fff;
}

.quiz-choice__text {
  font-size: var(--text-sm);
  line-height: 1.5;
}

.quiz-choice__submit {
  width: 100%;
}

.quiz-choice__feedback {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  text-align: center;
}

.quiz-choice__feedback--correct {
  background-color: #ECFDF5;
  color: #059669;
}

.quiz-choice__feedback--wrong {
  background-color: #FEF2F2;
  color: #DC2626;
}
</style>
