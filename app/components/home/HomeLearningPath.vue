<template>
  <div class="path">
    <div
      v-for="(item, i) in learningPath"
      :key="item.step"
      class="path__row"
      :class="`path__row--${item.state}`"
    >
      <div class="path__step">
        <span class="path__num">{{ item.step }}</span>
        <span class="path__dot" :class="`path__dot--${item.state}`" aria-hidden="true"></span>
      </div>
      <div class="path__body">
        <div class="path__title">{{ item.title }}</div>
        <div class="path__detail">{{ item.detail }}</div>
      </div>
      <div class="path__state" :class="`path__state--${item.state}`">
        {{ stateLabel(item.state) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * HomeLearningPath — 学习路径时间线
 *
 * 仿 zed.dev 的 agent 任务流时间线列表：
 * - 每行：步骤号 + 状态点 / 标题 + 详情 / 右侧状态标签
 * - 等宽小字号、行高紧、密集信息
 * - 三种状态：done（已完成）/ active（进行中）/ todo（待发生）
 *
 * 内容为 LDS 认知顺序，得心实验室自有产品语言。
 */
import { learningPath } from './homeData'

function stateLabel(state: 'done' | 'active' | 'todo') {
  if (state === 'done') return '已理解'
  if (state === 'active') return '进行中'
  return '待发生'
}
</script>

<style scoped>
.path {
  display: flex;
  flex-direction: column;
}

.path__row {
  display: grid;
  grid-template-columns: 60px 1fr auto;
  align-items: baseline;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid var(--color-border);
}

.path__row:first-child {
  border-top: none;
}

.path__step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.path__num {
  font-family: 'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.path__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-border-strong);
}

.path__dot--done {
  background: var(--color-text-secondary);
}

.path__dot--active {
  background: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.path__body {
  min-width: 0;
}

.path__title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
}

.path__row--todo .path__title {
  color: var(--color-text-secondary);
}

.path__detail {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.path__row--todo .path__detail {
  color: var(--color-text-muted);
}

.path__state {
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.path__state--active {
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .path__row {
    grid-template-columns: 36px 1fr;
    gap: 0.75rem;
  }

  .path__state {
    grid-column: 2;
    margin-top: 0.5rem;
  }
}
</style>
