<!--
  QuizInput 组件 - 填空题
  功能说明：
  - 展示填空题题目和输入框，支持用户输入答案
  - 输入答案后可点击提交按钮或按回车键提交
  - 提交后自动判题（忽略大小写和首尾空格）
  - 显示判题反馈信息（回答正确/错误及正确答案）
  - 提交后禁用输入框，防止重复作答
-->
<template>
  <div class="quiz-input">
    <!-- 题目文本 -->
    <p class="quiz-input__question">{{ question }}</p>
    <!-- 输入区域：输入框和提交按钮 -->
    <div class="quiz-input__field">
      <!-- 答案输入框：绑定 v-model、支持回车提交、提交后禁用 -->
      <input
        v-model="userAnswer"
        class="quiz-input__input"
        :placeholder="placeholder"
        :disabled="answered"
        @keyup.enter="submitAnswer"
      />
      <!-- 提交按钮：未提交时显示，输入为空时禁用 -->
      <button
        v-if="!answered"
        class="quiz-input__submit btn btn--primary"
        @click="submitAnswer"
        :disabled="!userAnswer.trim()"
      >
        提交
      </button>
    </div>
    <!-- 判题反馈：提交后显示正确/错误信息 -->
    <div v-if="answered" class="quiz-input__feedback" :class="isCorrect ? 'quiz-input__feedback--correct' : 'quiz-input__feedback--wrong'">
      <template v-if="isCorrect">回答正确！</template>
      <template v-else>回答错误，正确答案是 {{ correctAnswer }}</template>
    </div>
  </div>
</template>

<script setup>
/**
 * 填空题组件：支持输入答案、提交判题、反馈
 * @component QuizInput
 */
import { ref, computed } from 'vue'

const props = defineProps({
  /** 题目文本内容 */
  question: { type: String, required: true },
  /** 正确答案文本 */
  correctAnswer: { type: String, required: true },
  /** 输入框占位提示文字 */
  placeholder: { type: String, default: '请输入答案' },
})

/** 用户输入的答案 */
const userAnswer = ref('')

/** 是否已提交答案，提交后禁用输入和显示反馈 */
const answered = ref(false)

/**
 * 计算属性：判断用户答案是否正确
 * 比较时忽略首尾空格和大小写
 */
const isCorrect = computed(() =>
  userAnswer.value.trim().toLowerCase() === props.correctAnswer.trim().toLowerCase()
)

/** 提交答案：输入不为空时将 answered 置为 true 以触发判题反馈 */
function submitAnswer() {
  if (userAnswer.value.trim()) {
    answered.value = true
  }
}
</script>

<style scoped>
/* 填空题容器：白色背景、边框、圆角 */
.quiz-input {
  padding: var(--spacing-lg);
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
}

/* 题目文本：加粗、较大字号 */
.quiz-input__question {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

/* 输入区域：水平布局、输入框和按钮并排 */
.quiz-input__field {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

/* 输入框：自适应宽度、带边框和聚焦样式 */
.quiz-input__input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font-size: var(--text-sm);
  transition: border-color 0.2s ease;
}

/* 输入框聚焦样式：主题色边框和光晕 */
.quiz-input__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

/* 输入框禁用样式：灰色背景 */
.quiz-input__input:disabled {
  background-color: var(--color-bg-secondary);
}

/* 提交按钮：不收缩 */
.quiz-input__submit {
  flex-shrink: 0;
}

/* 判题反馈：居中、加粗、圆角 */
.quiz-input__feedback {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  text-align: center;
}

/* 正确反馈：浅绿背景、绿色文字 */
.quiz-input__feedback--correct {
  background-color: #ECFDF5;
  color: #059669;
}

/* 错误反馈：浅红背景、红色文字 */
.quiz-input__feedback--wrong {
  background-color: #FEF2F2;
  color: #DC2626;
}
</style>
