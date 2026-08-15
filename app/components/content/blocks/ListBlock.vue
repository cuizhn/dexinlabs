<template>
  <component :is="block.ordered ? 'ol' : 'ul'" class="list">
    <li v-for="(item, i) in block.items" :key="i">
      <ContentInlineRenderer :nodes="item" />
    </li>
  </component>
</template>

<script setup lang="ts">
/**
 * ListBlock 组件 - 列表
 *
 * 根据 ordered 渲染为 <ol> 或 <ul>。
 * items 为 Inline[][]，每项是 Inline[]，由 InlineRenderer 统一渲染。
 */
import type { ListBlock } from '@shared/lessonAST'

defineProps<{ block: ListBlock }>()
</script>

<style scoped>
.list {
  margin: var(--spacing-sm) 0;
  padding-left: var(--spacing-lg);
}
li {
  margin: var(--spacing-xs) 0;
}
</style>
