<template>
  <component :is="block.ordered ? 'ol' : 'ul'" class="block-list">
    <li v-for="(item, i) in block.items" :key="i" v-html="item" />
  </component>
</template>

<script setup lang="ts">
/**
 * ListBlock 组件 - 列表
 *
 * 根据 ordered 渲染为 <ol> 或 <ul>，每项为 compiler 编译后的 HTML。
 */
import type { ListBlock } from '~/learning/lesson-ast'

defineProps<{ block: ListBlock }>()
</script>

<style scoped>
.block-list {
  margin: 0.75em 0;
  padding-left: 1.5em;
}
.block-list li {
  margin: 0.25em 0;
}
</style>
