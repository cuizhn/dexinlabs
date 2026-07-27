<template>
  <!-- Lesson 右侧学习辅助面板 - 显示学习提示、相关知识和诊断提醒 -->
  <div class="lesson-assistant">
    <h3 class="lesson-assistant__title">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="2" />
        <path d="M9 6v3M9 12h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      学习助手
    </h3>

    <!-- 学习提示区域 -->
    <div class="lesson-assistant__section">
      <h4 class="lesson-assistant__section-title">学习提示</h4>
      <p class="lesson-assistant__tip">
        {{ currentTip }}
      </p>
    </div>

    <!-- 相关知识区域 -->
    <div class="lesson-assistant__section">
      <h4 class="lesson-assistant__section-title">相关知识</h4>
      <ul class="lesson-assistant__related">
        <li v-for="(item, idx) in relatedTopics" :key="idx" class="lesson-assistant__related-item">
          {{ item }}
        </li>
      </ul>
    </div>

    <!-- 诊断提醒区域（占位） -->
    <div class="lesson-assistant__section lesson-assistant__section--muted">
      <h4 class="lesson-assistant__section-title">诊断提醒</h4>
      <p class="lesson-assistant__placeholder">
        完成更多课时后，这里会显示针对性的学习建议。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * LessonAssistant - Lesson 右侧学习辅助面板组件
 *
 * 显示学习提示、相关知识和诊断提醒。
 * 当前全部使用静态 Mock 数据作为占位。
 * 未来接入 Progress Engine 和 Diagnosis Engine 后，
 * 可根据学习状态动态生成提示和诊断信息。
 */

// 当前使用静态提示数据
// 未来根据 Lesson 内容和学习状态动态生成
const currentTip = '阅读时注意区分「定义」和「性质」，它们是不同的概念层次。'

// 当前使用静态相关知识列表
// 未来由 Concept Graph 提供
const relatedTopics = [
  '前置知识：一元一次方程',
  '关联概念：判别式与根的关系',
  '后续内容：二次函数的应用'
]
</script>

<style scoped>
.lesson-assistant {
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
}

.lesson-assistant__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.lesson-assistant__title svg {
  color: var(--color-primary);
  flex-shrink: 0;
}

.lesson-assistant__section {
  margin-bottom: var(--spacing-lg);
}

.lesson-assistant__section:last-child {
  margin-bottom: 0;
}

.lesson-assistant__section--muted {
  opacity: 0.6;
}

.lesson-assistant__section-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 var(--spacing-sm);
}

.lesson-assistant__tip {
  font-size: 0.875rem;
  color: var(--color-text-primary);
  line-height: 1.6;
  margin: 0;
  padding: var(--spacing-md);
  background: rgba(79, 70, 229, 0.04);
  border-radius: var(--border-radius-sm);
  border-left: 3px solid var(--color-primary);
}

.lesson-assistant__related {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.lesson-assistant__related-item {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  padding: var(--spacing-xs) 0;
  line-height: 1.5;
}

.lesson-assistant__related-item::before {
  content: '·';
  margin-right: 6px;
  color: var(--color-primary);
  font-weight: 700;
}

.lesson-assistant__placeholder {
  font-size: 0.8125rem;
  color: var(--color-text-light);
  line-height: 1.6;
  margin: 0;
  font-style: italic;
}
</style>
