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
  info: '信息',
  tip: '提示',
  warning: '注意',
  danger: '警告'
}
const label = computed(() => labelMap[props.block.level])
</script>

<style scoped>
/* 提示：结构线分节 + 小标签，无底色；仅标签文字使用语义色 */
.hint {
  margin: 2rem 0;
  padding: 0.75rem 0 0;
  border-top: 1px solid var(--color-border);
}
.header {
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
}
.hint--info .header {
  color: var(--color-primary);
}
.hint--tip .header {
  color: var(--color-text-secondary);
}
.hint--warning .header {
  color: var(--color-warning);
}
.hint--danger .header {
  color: var(--color-error);
}
.body {
  color: var(--color-text);
}
</style>
