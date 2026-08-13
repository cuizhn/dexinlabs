<template>
  <div class="definition">
    <dt class="term">{{ block.term }}</dt>
    <dd class="content" v-html="block.content" />
  </div>
</template>

<script setup lang="ts">
/**
 * DefinitionBlock 组件 - 定义（术语解释）
 *
 * 使用 <dl>/<dt>/<dd> 语义化标签渲染数学术语定义。
 */
import type { DefinitionBlock } from '~/learning/lesson-ast'

defineProps<{ block: DefinitionBlock }>()
</script>

<style scoped>
.definition {
  margin: var(--spacing-md) 0;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius-sm);
}

.term {
  font-weight: 700;
  font-size: 1.05em;
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.content {
  margin: 0;
}
</style>
