<template>
  <div class="code">
    <div v-if="block.language && block.language !== 'text'" class="lang">
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
import type { CodeBlock } from '@shared/lessonAST'

defineProps<{ block: CodeBlock }>()
</script>

<style scoped>
.code {
  margin: var(--spacing-md) 0;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  background: var(--color-code-bg);
  color: var(--color-code-text);
}
.lang {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--text-xs);
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-muted);
  text-transform: uppercase;
}
pre {
  margin: 0;
  padding: var(--spacing-md);
  overflow-x: auto;
  font-size: var(--text-sm);
  line-height: 1.6;
}
</style>
