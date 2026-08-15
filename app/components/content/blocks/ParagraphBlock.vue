<template>
  <p class="paragraph">
    <ContentInlineRenderer :nodes="block.children" />
  </p>
</template>

<script setup lang="ts">
/**
 * ParagraphBlock 组件 - 段落
 *
 * 消费 Lesson AST 的 ParagraphBlock，children 为 Inline[] 语义结构，
 * 由 InlineRenderer 统一渲染为 HTML。
 */
import type { ParagraphBlock } from '@shared/lessonAST'

defineProps<{ block: ParagraphBlock }>()
</script>
