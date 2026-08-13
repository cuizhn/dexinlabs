<template>
  <!-- 继续学习卡片 - 首页「继续学习」模式下展示当前学习进度 -->
  <div v-if="recentLearning" class="card">
    <div class="header">
      <span class="label">继续学习</span>
      <span v-if="streakDays > 0" class="streak">
        🔥 连续 {{ streakDays }} 天
      </span>
    </div>

    <div class="info">
      <span class="topic">{{ recentLearning.topicTitle }}</span>
      <span class="lesson">
        第 {{ recentLearning.lessonIndex }} 课 · {{ recentLearning.lessonTitle }}
      </span>
    </div>

    <div class="progress">
      <span class="progress-text">
        {{ recentLearning.lessonIndex }} / {{ recentLearning.totalLessons }}
      </span>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${(recentLearning.lessonIndex / recentLearning.totalLessons) * 100}%` }"
        ></div>
      </div>
    </div>

    <NuxtLink
      :to="`/courses/${recentLearning.topicSlug}/${recentLearning.lessonSlug}`"
      class="btn"
    >
      继续学习
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
/**
 * ContinueLearningCard - 继续学习卡片组件
 *
 * 首页「继续学习」模式下的核心组件。
 * 显示当前学习的 Topic/Lesson、进度条和连续学习天数。
 * 数据来源统一由 useLearningState 提供。
 */
import { useLearningState } from '~/composables/useLearningState'

const { recentLearning, streakDays } = useLearningState()
</script>

<style scoped>
.card {
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-2xl);
  text-align: left;
  box-shadow: var(--shadow-sm);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.streak {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.info {
  margin-bottom: var(--spacing-lg);
}

.topic {
  display: block;
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.lesson {
  display: block;
  font-size: var(--text-base);
  color: var(--color-text-secondary);
}

.progress {
  margin-bottom: var(--spacing-xl);
}

.progress-text {
  display: block;
  font-size: 0.8125rem;
  color: var(--color-text-light);
  margin-bottom: var(--spacing-sm);
}

.progress-bar {
  height: 6px;
  background: var(--color-bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: 3px;
  transition: width 0.5s ease;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-md);
  font-weight: 600;
  font-size: var(--text-base);
  text-decoration: none;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-primary);
  transition: all 0.25s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-primary-hover);
}
</style>
