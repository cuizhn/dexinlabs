<template>
  <div class="quiz-input">
    <p class="quiz-input__question">{{ question }}</p>

    <div class="quiz-input__field">
      <input
        v-model="userAnswer"
        class="quiz-input__input"
        :placeholder="placeholder"
        :disabled="answered"
        @keyup.enter="submitAnswer"
      />

      <button
        v-if="!answered"
        class="quiz-input__submit btn btn--primary"
        @click="submitAnswer"
        :disabled="!userAnswer.trim()"
      >
        提交
      </button>
    </div>

    <div
      v-if="answered"
      class="quiz-input__feedback"
      :class="isCorrect ? 'quiz-input__feedback--correct' : 'quiz-input__feedback--wrong'"
    >
      <template v-if="isCorrect">回答正确！ </template>
      <template v-else> 回答错误，正确答案是 {{ correctAnswer }} </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  question: { type: String, required: true },

  correctAnswer: { type: String, required: true },

  placeholder: { type: String, default: '请输入答案' }
})

const userAnswer = ref('')

const answered = ref(false)

const isCorrect = computed(() => userAnswer.value.trim().toLowerCase() === props.correctAnswer.trim().toLowerCase())

function submitAnswer() {
  if (userAnswer.value.trim()) {
    answered.value = true
  }
}
</script>

<style scoped>
.quiz-input {
  padding: var(--spacing-lg);
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
}

.quiz-input__question {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.quiz-input__field {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.quiz-input__input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font-size: var(--text-sm);
  transition: border-color 0.2s ease;
}

.quiz-input__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.quiz-input__input:disabled {
  background-color: var(--color-bg-secondary);
}

.quiz-input__submit {
  flex-shrink: 0;
}

.quiz-input__feedback {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  text-align: center;
}

.quiz-input__feedback--correct {
  background-color: #ecfdf5;
  color: #059669;
}

.quiz-input__feedback--wrong {
  background-color: #fef2f2;
  color: #dc2626;
}
</style>
