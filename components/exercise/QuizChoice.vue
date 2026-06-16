<!--
  QuizChoice 组件 - 选择题
  功能说明：
  - 展示选择题题目和选项列表，支持单选
  - 用户点击选项进行选择，选中后可提交答案
  - 提交后自动判题：正确选项显示绿色，错误选项显示红色
  - 显示判题反馈信息（回答正确/错误及正确答案）
  - 提交后禁用所有选项，防止重复作答
-->
<template>
  <div class="quiz-choice">
    <!-- 题目文本 -->
    <p class="quiz-choice__question">{{ question }}</p>
    <!-- 选项列表 -->
    <div class="quiz-choice__options">
      <!-- 选项按钮：根据状态显示选中/正确/错误样式，提交后禁用 -->
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
    <!-- 提交按钮：选中选项后且未提交时显示 -->
    <button
      v-if="selected !== null && !answered"
      class="quiz-choice__submit btn btn--primary"
      @click="submitAnswer"
    >
      提交答案
    </button>
    <!-- 判题反馈：提交后显示正确/错误信息 -->
    <div v-if="answered" class="quiz-choice__feedback" :class="isCorrect ? 'quiz-choice__feedback--correct' : 'quiz-choice__feedback--wrong'">
      {{ isCorrect ? '回答正确！' : '回答错误，正确答案是 ' + optionLabels[correctIndex] }}
    </div>
  </div>
</template>

<script setup>
/**
 * 选择题组件：支持单选、提交判题、反馈
 * @component QuizChoice
 */
import { ref, computed } from 'vue'

const props = defineProps({
  /** 题目文本内容 */
  question: { type: String, required: true },
  /** 选项数组，每个元素为一个选项的文本 */
  options: { type: Array, required: true },
  /** 正确答案的索引（从 0 开始） */
  correctIndex: { type: Number, required: true },
})

/** 当前选中的选项索引，未选择时为 null */
const selected = ref(null)

/** 是否已提交答案，提交后禁用选项和显示反馈 */
const answered = ref(false)

/** 选项标签映射（A/B/C/D） */
const optionLabels = ['A', 'B', 'C', 'D']

/** 计算属性：判断当前选择是否正确 */
const isCorrect = computed(() => selected.value === props.correctIndex)

/**
 * 选择某个选项
 * @param {number} index - 选项索引
 * 仅在未提交时允许选择
 */
function selectOption(index) {
  if (!answered.value) {
    selected.value = index
  }
}

/** 提交答案，将 answered 置为 true 以触发判题反馈 */
function submitAnswer() {
  answered.value = true
}
</script>

<style scoped>
/* 选择题容器：白色背景、边框、圆角 */
.quiz-choice {
  padding: var(--spacing-lg);
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
}

/* 题目文本：加粗、较大字号 */
.quiz-choice__question {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

/* 选项列表：垂直排列、紧凑间距 */
.quiz-choice__options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

/* 选项按钮：水平布局、带边框和圆角、过渡动画 */
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

/* 选项悬停样式（未禁用时）：主题色边框和浅背景 */
.quiz-choice__option:hover:not(:disabled) {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

/* 选中状态的选项：主题色边框和浅背景 */
.quiz-choice__option--selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

/* 正确选项样式：绿色边框和浅绿背景 */
.quiz-choice__option--correct {
  border-color: var(--color-success);
  background-color: #ECFDF5;
}

/* 错误选项样式：红色边框和浅红背景 */
.quiz-choice__option--wrong {
  border-color: var(--color-error);
  background-color: #FEF2F2;
}

/* 选项标签（A/B/C/D）：圆形背景、居中显示 */
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

/* 选中状态的选项标签：主题色背景、白色文字 */
.quiz-choice__option--selected .quiz-choice__label {
  background-color: var(--color-primary);
  color: #fff;
}

/* 选项文本 */
.quiz-choice__text {
  font-size: var(--text-sm);
  line-height: 1.5;
}

/* 提交按钮：全宽 */
.quiz-choice__submit {
  width: 100%;
}

/* 判题反馈：居中、加粗、圆角 */
.quiz-choice__feedback {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  text-align: center;
}

/* 正确反馈：浅绿背景、绿色文字 */
.quiz-choice__feedback--correct {
  background-color: #ECFDF5;
  color: #059669;
}

/* 错误反馈：浅红背景、红色文字 */
.quiz-choice__feedback--wrong {
  background-color: #FEF2F2;
  color: #DC2626;
}
</style>
