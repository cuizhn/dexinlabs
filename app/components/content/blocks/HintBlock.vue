<template>
  <div :class="['hint', `hint--${block.level}`]">
    <div class="header">
      {{ label }}
    </div>
    <div class="body">
      <ContentRenderer :blocks="block.children" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * HintBlock 组件 - 提示 / 注意 / 警告
 *
 * 根据 level 显示不同样式的提示框。
 * children 为 Block[]，通过 ContentRenderer 递归渲染。
 */
import type { HintBlock } from '@shared/lessonAST'

const props = defineProps<{ block: HintBlock }>()

/** 各级别的中文标签 */
const labelMap: Record<HintBlock['level'], string> = {
  info: '💡 信息',
  tip: '✨ 提示',
  warning: '⚠️ 注意',
  danger: '🚨 警告'
}
const label = computed(() => labelMap[props.block.level])
</script>

<style scoped>
.hint {
  margin: var(--spacing-md) 0;
  padding: var(--spacing-sm) var(--spacing-md);
  border-left: 4px solid;
  border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
}
.hint--info {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
.hint--tip {
  border-color: var(--color-success);
  background: var(--color-success-bg);
}
.hint--warning {
  border-color: var(--color-warning);
  background: rgba(245, 158, 11, 0.08);
}
.hint--danger {
  border-color: var(--color-error);
  background: rgba(239, 68, 68, 0.08);
}
.header {
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  font-size: var(--text-sm);
}
.body {
  color: var(--color-text);
}
</style>
