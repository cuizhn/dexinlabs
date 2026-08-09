<template>
  <div :class="['block-hint', `block-hint--${block.level}`]">
    <div class="block-hint__header">
      {{ label }}
    </div>
    <div class="block-hint__body" v-html="block.content" />
  </div>
</template>

<script setup lang="ts">
/**
 * HintBlock 组件 - 提示 / 注意 / 警告
 *
 * 根据 level 显示不同样式的提示框。
 */
import type { HintBlock } from '~/learning/lesson-ast'

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
.block-hint {
  margin: 1em 0;
  padding: 0.75em 1em;
  border-left: 4px solid;
  border-radius: 0 6px 6px 0;
}
.block-hint--info {
  border-color: #4a90d9;
  background: #eef5fc;
}
.block-hint--tip {
  border-color: #27ae60;
  background: #eefbf3;
}
.block-hint--warning {
  border-color: #f39c12;
  background: #fef9ee;
}
.block-hint--danger {
  border-color: #e74c3c;
  background: #fdeeed;
}
.block-hint__header {
  font-weight: 600;
  margin-bottom: 0.5em;
  font-size: 0.9375rem;
}
</style>
