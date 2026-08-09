<template>
  <div class="block-definition">
    <dt class="block-definition__term">{{ block.term }}</dt>
    <dd class="block-definition__content" v-html="block.content" />
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
.block-definition {
  margin: 1em 0;
  padding: 0.75em 1em;
  background: var(--color-bg-secondary, #f8f9fa);
  border-radius: 6px;
}
.block-definition__term {
  font-weight: 700;
  font-size: 1.05em;
  color: var(--color-primary, #4a90d9);
  margin-bottom: 0.25em;
}
.block-definition__content {
  margin: 0;
}
</style>
