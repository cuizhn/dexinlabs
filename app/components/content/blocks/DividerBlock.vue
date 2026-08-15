<template>
  <hr class="divider" />
</template>

<script setup lang="ts">
/**
 * DividerBlock 组件 - 分隔线
 *
 * 纯视觉分隔，无内容。
 */
import type { DividerBlock } from '@shared/lessonAST'

defineProps<{ block: DividerBlock }>()
</script>

<style scoped>
.divider {
  margin: var(--spacing-lg) 0;
  border: none;
  border-top: 1px solid var(--color-border);
}
</style>
