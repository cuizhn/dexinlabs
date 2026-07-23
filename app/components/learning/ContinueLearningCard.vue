<template>
  <!-- 继续学习卡片 - 首页「继续学习」模式下展示当前学习进度 -->
  <div v-if="recentLearning" class="continue-card">
    <div class="continue-card__header">
      <span class="continue-card__label">继续学习</span>
      <span v-if="streakDays > 0" class="continue-card__streak">
        🔥 连续 {{ streakDays }} 天
      </span>
    </div>

    <div class="continue-card__info">
      <span class="continue-card__topic">{{ recentLearning.topicTitle }}</span>
      <span class="continue-card__lesson">
        第 {{ recentLearning.lessonIndex }} 课 · {{ recentLearning.lessonTitle }}
      </span>
    </div>

    <div class="continue-card__progress">
      <span class="continue-card__progress-text">
        {{ recentLearning.lessonIndex }} / {{ recentLearning.totalLessons }}
      </span>
      <div class="continue-card__progress-bar">
        <div
          class="continue-card__progress-fill"
          :style="{ width: `${(recentLearning.lessonIndex / recentLearning.totalLessons) * 100}%` }"
        ></div>
      </div>
    </div>

    <NuxtLink
      :to="`/${recentLearning.topicSlug}`"
      class="continue-card__btn"
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
.continue-card {
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-2xl);
  text-align: left;
  box-shadow: var(--shadow-sm);
}

.continue-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.continue-card__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.continue-card__streak {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.continue-card__info {
  margin-bottom: var(--spacing-lg);
}

.continue-card__topic {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.continue-card__lesson {
  display: block;
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.continue-card__progress {
  margin-bottom: var(--spacing-xl);
}

.continue-card__progress-text {
  display: block;
  font-size: 0.8125rem;
  color: var(--color-text-light);
  margin-bottom: 8px;
}

.continue-card__progress-bar {
  height: 6px;
  background: var(--color-bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.continue-card__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: 3px;
  transition: width 0.5s ease;
}

.continue-card__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px 32px;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  background: linear-gradient(135deg, var(--color-primary), #6366f1);
  color: #fff;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
  transition: all 0.25s ease;
}

.continue-card__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4);
}
</style>
