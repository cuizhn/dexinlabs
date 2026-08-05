<template>
  <p class="block-paragraph" v-html="html" />
</template>

<script setup lang="ts">
/**
 * ParagraphBlock 组件 - 段落
 *
 * 渲染行内 Markdown 内容为段落。
 */
import { renderInline } from '@markdown'
import type { ParagraphBlock } from '@content/types/ast'

const props = defineProps<{ block: ParagraphBlock }>()
const html = computed(() => renderInline(props.block.content))
</script>
