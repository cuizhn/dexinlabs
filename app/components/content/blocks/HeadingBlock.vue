<template>
  <component :is="tag" class="heading">
    <ContentInlineRenderer :nodes="block.children" />
  </component>
</template>

<script setup lang="ts">
/**
 * HeadingBlock 组件 - 标题
 *
 * 根据 level 渲染 h2-h5（level 1-4 对应 h2-h5，h1 由课时 title 承担）。
 * children 为 Inline[] 语义结构，由 InlineRenderer 统一渲染。
 */
import type { HeadingBlock } from '@shared/lessonAST'

const props = defineProps<{ block: HeadingBlock }>()
/** level 1→h2, 2→h3, 3→h4, 4→h5 */
const tag = computed(() => `h${props.block.level + 1}` as const)
</script>
