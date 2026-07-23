<template>
  <!-- Lesson 左侧概念清单 - 显示本课需要解决的问题和概念 -->
  <div class="lesson-checklist">
    <h3 class="lesson-checklist__title">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 9l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      今天需要解决的问题
    </h3>

    <ul class="lesson-checklist__items">
      <li
        v-for="(item, idx) in checklistItems"
        :key="idx"
        class="lesson-checklist__item"
        :class="{ 'lesson-checklist__item--done': item.done }"
      >
        <span class="lesson-checklist__checkbox">
          <template v-if="item.done">✓</template>
        </span>
        <span class="lesson-checklist__text">{{ item.text }}</span>
      </li>
    </ul>

    <div class="lesson-checklist__progress">
      <span class="lesson-checklist__progress-text">
        学习进度 {{ completedCount }} / {{ checklistItems.length }}
      </span>
      <div class="lesson-checklist__progress-bar">
        <div
          class="lesson-checklist__progress-fill"
          :style="{ width: `${(completedCount / checklistItems.length) * 100}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * LessonChecklist - Lesson 左侧概念清单组件
 *
 * 显示当前课时需要解决的问题和概念清单。
 * 当前使用静态 Mock 数据，未来由 Lesson 数据动态生成。
 *
 * 设计意图：
 * - 让学习者在开始阅读前明确学习目标
 * - 提供可视化的进度追踪
 * - 未来可接入 Progress Engine 实现自动勾选
 */

interface ChecklistItem {
  text: string
  done: boolean
}

// 当前使用静态数据作为占位
// 未来根据 Lesson 的 Learning Unit 动态生成
const props = defineProps<{
  items?: ChecklistItem[]
}>()

/** 默认概念清单（Mock 数据） */
const defaultItems: ChecklistItem[] = [
  { text: '理解核心概念的定义', done: false },
  { text: '掌握基本公式的推导', done: false },
  { text: '能够应用到实际问题中', done: false }
]

const checklistItems = computed(() => props.items ?? defaultItems)

/** 已完成的问题数量 */
const completedCount = computed(() => checklistItems.value.filter(item => item.done).length)
</script>

<style scoped>
.lesson-checklist {
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
}

.lesson-checklist__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg);
}

.lesson-checklist__title svg {
  color: var(--color-primary);
  flex-shrink: 0;
}

.lesson-checklist__items {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.lesson-checklist__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  background: var(--color-bg-secondary);
  font-size: 0.875rem;
  color: var(--color-text-primary);
  transition: all 150ms ease;
}

.lesson-checklist__item--done {
  background: rgba(34, 197, 94, 0.08);
  color: var(--color-text-secondary);
}

.lesson-checklist__checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #16a34a;
  flex-shrink: 0;
}

.lesson-checklist__item--done .lesson-checklist__checkbox {
  border-color: #16a34a;
  background: rgba(34, 197, 94, 0.1);
}

.lesson-checklist__text {
  flex: 1;
}

.lesson-checklist__item--done .lesson-checklist__text {
  text-decoration: line-through;
}

.lesson-checklist__progress {
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-md);
}

.lesson-checklist__progress-text {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-light);
  margin-bottom: 6px;
}

.lesson-checklist__progress-bar {
  height: 4px;
  background: var(--color-bg-secondary);
  border-radius: 2px;
  overflow: hidden;
}

.lesson-checklist__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: 2px;
  transition: width 0.5s ease;
}
</style>
