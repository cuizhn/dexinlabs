<template>
  <div class="formula" :class="{ 'formula--inline': !block.display }" v-html="html" />
</template>

<script setup lang="ts">
/**
 * FormulaBlock 组件 - 数学公式
 *
 * 直接使用 KaTeX 渲染 LaTeX 公式。
 * display=true 为块级公式（居中展示），display=false 为行内公式。
 *
 * 不依赖 Markdown 解析，直接接收 AST 中的 LaTeX 源文本。
 */
import katex from 'katex'
import type { FormulaBlock } from '@shared/lesson-ast'

const props = defineProps<{ block: FormulaBlock }>()

/** 将 LaTeX 源文本通过 KaTeX 渲染为 HTML */
const html = computed(() => {
  try {
    return katex.renderToString(props.block.latex, {
      displayMode: props.block.display,
      throwOnError: false,
      strict: false
    })
  } catch {
    return props.block.latex
  }
})
</script>

<style scoped>
.formula {
  margin: var(--spacing-md) 0;
  text-align: center;
  overflow-x: auto;
}
.formula--inline {
  display: inline;
  margin: 0;
  text-align: inherit;
}
</style>
