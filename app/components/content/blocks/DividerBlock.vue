<template>
  <hr class="block-divider" />
</template>

<script setup lang="ts">
/**
 * DividerBlock 组件 - 分隔线
 *
 * 纯视觉分隔，无内容。
 */
import type { DividerBlock } from '@content/types/ast'

defineProps<{ block: DividerBlock }>()
</script>

<style scoped>
.block-divider {
  margin: 1.5em 0;
  border: none;
  border-top: 1px solid var(--color-border, #eee);
}
</style>
