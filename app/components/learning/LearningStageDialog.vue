<template>
  <!-- 学习阶段选择弹窗 - 首次进入时让用户选择学习阶段 -->
  <div class="overlay" @click.self="$emit('close')">
    <div class="dialog">
      <div class="header">
        <h2 class="title">选择你的学习阶段</h2>
        <p class="desc">
          我们会根据你的阶段推荐合适的学习内容
        </p>
      </div>

      <div class="options">
        <button
          v-for="stage in stages"
          :key="stage.value"
          class="option"
          @click="$emit('select', stage.value)"
        >
          <span class="icon">{{ stage.icon }}</span>
          <div class="text">
            <span class="label">{{ stage.label }}</span>
            <span class="desc">{{ stage.desc }}</span>
          </div>
        </button>
      </div>

      <button class="cancel" @click="$emit('close')">
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
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: var(--spacing-lg);
}

.dialog {
  background: var(--color-bg-white);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-2xl);
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}

.desc {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.option {
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

.option:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-ghost-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.icon {
  font-size: 1.75rem;
  flex-shrink: 0;
}

.text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.label {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-primary);
}

.option .desc {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.cancel {
  display: block;
  width: 100%;
  padding: var(--spacing-sm);
  border: none;
  background: none;
  color: var(--color-text-light);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: color 150ms ease;
}

.cancel:hover {
  color: var(--color-text-secondary);
}
</style>
