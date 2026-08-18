<template>
  <div class="path">
    <div
      v-for="(item, i) in learningPath"
      :key="item.step"
      class="path__row"
      :class="`path__row--${item.state}`"
    >
      <!-- 竖轴列：dot + 向下延伸的竖线 -->
      <div class="path__rail">
        <span class="path__dot" :class="`path__dot--${item.state}`" aria-hidden="true"></span>
      </div>
      <!-- 步骤号 -->
      <div class="path__step">{{ item.step }}</div>
      <!-- 标题 + 详情 -->
      <div class="path__body">
        <div class="path__title">{{ item.title }}</div>
        <div class="path__detail">{{ item.detail }}</div>
      </div>
      <!-- 右侧状态标签 -->
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
 * 仿 zed.dev 的 agent 任务流时间线：
 * - 左侧竖轴（path__rail）串联所有步骤节点（dot）
 * - 竖线由 path__rail::after 从 dot 底部延伸到 row 底部
 * - 最后一行竖线不延伸（::after 隐藏）
 * - 三种状态：done（已完成）/ active（进行中）/ todo（待发生）
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
  grid-template-columns: 24px 36px 1fr auto;
  align-items: baseline;
  gap: 0.75rem;
  padding: 1rem 0;
}

/* 左侧竖轴列 */
.path__rail {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
}

/* 竖线：从 dot 中心向下延伸到 row 底部，连接下一行 */
.path__rail::after {
  content: '';
  position: absolute;
  left: 50%;
  top: calc(50% + 6px); /* dot 半径以下 */
  bottom: 0;
  width: 0.8px;
  background: var(--color-border);
  transform: translateX(-50%);
}

/* 最后一行不画竖线 */
.path__row:last-child .path__rail::after {
  display: none;
}

.path__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border);
  border: 1px solid var(--color-border);
  z-index: 1;
}

.path__dot--done {
  background: var(--color-text-secondary);
  border-color: var(--color-text-secondary);
}

.path__dot--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.path__step {
  font-family: 'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-muted);
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
    grid-template-columns: 20px 28px 1fr;
    gap: 0.5rem;
  }

  .path__state {
    grid-column: 3;
    margin-top: 0.5rem;
  }
}
</style>
