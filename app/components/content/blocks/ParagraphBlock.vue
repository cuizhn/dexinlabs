<template>
  <p class="block-paragraph" v-html="block.content" />
</template>

<script setup lang="ts">
/**
 * ParagraphBlock 组件 - 段落
 *
 * 渲染 compiler 编译后的段落内容。
 */
import type { ParagraphBlock } from '~/learning/lesson-ast'

defineProps<{ block: ParagraphBlock }>()
</script>
