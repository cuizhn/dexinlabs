<template>
  <div class="block-code">
    <div v-if="block.language && block.language !== 'text'" class="block-code__lang">
      {{ block.language }}
    </div>
    <pre><code>{{ block.code }}</code></pre>
  </div>
</template>

<script setup lang="ts">
/**
 * CodeBlock 组件 - 代码块
 *
 * 展示代码内容，可选显示语言标签。
 * 语法高亮由未来的 Markdown Engine 或独立模块处理。
 */
import type { CodeBlock } from '~/learning/lesson-ast'

defineProps<{ block: CodeBlock }>()
</script>

<style scoped>
.block-code {
  margin: 1em 0;
  border-radius: 6px;
  overflow: hidden;
  background: #1e1e1e;
  color: #d4d4d4;
}
.block-code__lang {
  padding: 0.25em 1em;
  font-size: 0.75rem;
  background: #333;
  color: #999;
  text-transform: uppercase;
}
.block-code pre {
  margin: 0;
  padding: 1em;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.6;
}
</style>
