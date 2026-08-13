<template>
  <!-- Lesson 左侧概念清单 - 显示本课需要解决的问题和概念 -->
  <div class="panel">
    <h3 class="title">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 9l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      今天需要解决的问题
    </h3>

    <ul class="items">
      <li
        v-for="(item, idx) in checklistItems"
        :key="idx"
        class="item"
        :class="{ done: item.done }"
      >
        <span class="checkbox">
          <template v-if="item.done">✓</template>
        </span>
        <span class="text">{{ item.text }}</span>
      </li>
    </ul>

    <div class="progress">
      <span class="progress-text">
        学习进度 {{ completedCount }} / {{ checklistItems.length }}
      </span>
      <div class="progress-bar">
        <div
          class="progress-fill"
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
.panel {
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
}

.title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg);
}

.title svg {
  color: var(--color-primary);
  flex-shrink: 0;
}

.items {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  background: var(--color-bg-secondary);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  transition: all 150ms ease;
}

.item.done {
  background: var(--color-success-bg);
  color: var(--color-text-secondary);
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--color-success-dark);
  flex-shrink: 0;
}

.item.done .checkbox {
  border-color: var(--color-success-dark);
  background: var(--color-success-bg);
}

.text {
  flex: 1;
}

.item.done .text {
  text-decoration: line-through;
}

.progress {
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-md);
}

.progress-text {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-text-light);
  margin-bottom: var(--spacing-xs);
}

.progress-bar {
  height: 4px;
  background: var(--color-bg-secondary);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: 2px;
  transition: width 0.5s ease;
}
</style>
