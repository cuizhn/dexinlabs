<template>
  <!-- 学习状态徽章 - 根据 LearningState 显示对应的状态标签和图标 -->
  <span class="badge" :class="state.toLowerCase()">
    <span class="dot"></span>
    <span class="label">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
/**
 * LearningStateBadge - 学习状态徽章组件
 *
 * 根据传入的 LearningState 枚举值，显示对应的状态标签和颜色。
 * 统一所有页面中「待学习 / 正在学习 / 已掌握」的视觉表现。
 */
import type { LearningState } from '~/composables/useLearningState'
import { useLearningState } from '~/composables/useLearningState'

const props = defineProps<{
  /** 学习状态枚举值 */
  state: LearningState
}>()

const { getStateLabel } = useLearningState()

/** 状态对应的中文标签 */
const label = computed(() => getStateLabel(props.state))
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--border-radius-md);
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 待学习 - 灰色 */
.badge.not_started {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}

.badge.not_started .dot {
  background: var(--color-text-light);
}

/* 正在学习 - 蓝色 */
.badge.in_progress {
  background: var(--color-primary-ghost-accent);
  color: var(--color-primary);
}

.badge.in_progress .dot {
  background: var(--color-primary);
}

/* 已掌握 - 绿色 */
.badge.mastered {
  background: rgba(34, 197, 94, 0.08);
  color: var(--color-success-dark);
}

.badge.mastered .dot {
  background: var(--color-success-dark);
}
</style>
