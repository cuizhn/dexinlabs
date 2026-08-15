<template>
  <div class="definition">
    <dt class="term">{{ block.term }}</dt>
    <dd class="content">
      <ContentRenderer :blocks="block.children" />
    </dd>
  </div>
</template>

<script setup lang="ts">
/**
 * DefinitionBlock 组件 - 定义（术语解释）
 *
 * 使用 <dl>/<dt>/<dd> 语义化标签渲染数学术语定义。
 * children 为 Block[]，通过 ContentRenderer 递归渲染。
 */
import type { DefinitionBlock } from '@shared/lessonAST'

defineProps<{ block: DefinitionBlock }>()
</script>

<style scoped>
/* 教材式定义：结构线分节 + 小标签，不用卡片/底色 */
.definition {
  margin: 2.25rem 0;
  padding: 1.25rem 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.definition::before {
  content: '定义';
  display: block;
  margin-bottom: 0.5rem;
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.12em;
  color: var(--color-text-muted);
}

.term {
  font-weight: 600;
  font-size: 1.15em;
  letter-spacing: 0.01em;
  color: var(--color-heading);
  margin-bottom: var(--spacing-xs);
}

.content {
  margin: 0;
}
</style>
