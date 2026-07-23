<template>
  <!-- 学习阶段选择弹窗 - 首次进入时让用户选择学习阶段 -->
  <div class="stage-dialog__overlay" @click.self="$emit('close')">
    <div class="stage-dialog">
      <div class="stage-dialog__header">
        <h2 class="stage-dialog__title">选择你的学习阶段</h2>
        <p class="stage-dialog__desc">
          我们会根据你的阶段推荐合适的学习内容
        </p>
      </div>

      <div class="stage-dialog__options">
        <button
          v-for="stage in stages"
          :key="stage.value"
          class="stage-dialog__option"
          @click="$emit('select', stage.value)"
        >
          <span class="stage-dialog__option-icon">{{ stage.icon }}</span>
          <div class="stage-dialog__option-text">
            <span class="stage-dialog__option-label">{{ stage.label }}</span>
            <span class="stage-dialog__option-desc">{{ stage.desc }}</span>
          </div>
        </button>
      </div>

      <button class="stage-dialog__cancel" @click="$emit('close')">
        稍后再说
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * LearningStageDialog - 学习阶段选择弹窗
 *
 * 首次进入首页时显示，让用户选择当前学习阶段。
 * 选择后进入诊断问题流程（当前为占位），最终推荐合适的 Topic。
 *
 * 当前为 Mock 实现，未来接入诊断系统后：
 * 1. 根据阶段拉取对应的 3-5 个诊断问题
 * 2. 用户作答后生成初步诊断信息
 * 3. 存储诊断结果用于推荐
 */

defineEmits<{
  /** 关闭弹窗 */
  (e: 'close'): void
  /** 选择了学习阶段 */
  (e: 'select', stage: string): void
}>()

/** 学习阶段选项（Mock 数据） */
const stages = [
  {
    value: 'elementary',
    icon: '🌱',
    label: '小学阶段',
    desc: '基础运算、简单几何、初步统计'
  },
  {
    value: 'junior-high',
    icon: '🌿',
    label: '初中阶段',
    desc: '方程、函数、几何证明、概率统计'
  },
  {
    value: 'senior-high',
    icon: '🌳',
    label: '高中阶段',
    desc: '高等代数、解析几何、微积分初步'
  }
]
</script>

<style scoped>
.stage-dialog__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: var(--spacing-lg);
}

.stage-dialog {
  background: var(--color-bg-white);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-2xl);
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.stage-dialog__header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.stage-dialog__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}

.stage-dialog__desc {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.stage-dialog__options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.stage-dialog__option {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  background: var(--color-bg-white);
  cursor: pointer;
  text-align: left;
  transition: all 150ms ease;
}

.stage-dialog__option:hover {
  border-color: var(--color-primary);
  background: rgba(79, 70, 229, 0.02);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.stage-dialog__option-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
}

.stage-dialog__option-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stage-dialog__option-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.stage-dialog__option-desc {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.stage-dialog__cancel {
  display: block;
  width: 100%;
  padding: var(--spacing-sm);
  border: none;
  background: none;
  color: var(--color-text-light);
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 150ms ease;
}

.stage-dialog__cancel:hover {
  color: var(--color-text-secondary);
}
</style>
