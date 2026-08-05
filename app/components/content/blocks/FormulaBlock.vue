<template>
  <div class="block-formula" :class="{ 'block-formula--inline': !block.display }" v-html="html" />
</template>

<script setup lang="ts">
/**
 * FormulaBlock 组件 - 数学公式
 *
 * 使用 KaTeX 渲染 LaTeX 公式。
 * display=true 为块级公式（居中展示），display=false 为行内公式。
 *
 * 渲染流程：将 LaTeX 包装为 $$ 或 $ 格式，通过 renderInline 调用 KaTeX。
 */
import { renderInline } from '@markdown'
import type { FormulaBlock } from '@content/types/ast'

const props = defineProps<{ block: FormulaBlock }>()

/** 将 LaTeX 源文本转换为 KaTeX 可识别的 Markdown 格式 */
const html = computed(() => {
  const delimiter = props.block.display ? '$$' : '$'
  return renderInline(`${delimiter}${props.block.latex}${delimiter}`)
})
</script>

<style scoped>
.block-formula {
  margin: 1em 0;
  text-align: center;
  overflow-x: auto;
}
.block-formula--inline {
  display: inline;
  margin: 0;
  text-align: inherit;
}
</style>
