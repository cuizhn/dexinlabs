<template>
  <component :is="tag" class="block-heading" v-html="block.content" />
</template>

<script setup lang="ts">
/**
 * HeadingBlock 组件 - 标题
 *
 * 根据 level 渲染 h2-h5（level 1-4 对应 h2-h5，h1 由课时 title 承担）。
 */
import type { HeadingBlock } from '~/learning/lesson-ast'

const props = defineProps<{ block: HeadingBlock }>()
/** level 1→h2, 2→h3, 3→h4, 4→h5 */
const tag = computed(() => `h${props.block.level + 1}` as const)
</script>
