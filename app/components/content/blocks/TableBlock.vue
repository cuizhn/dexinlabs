<template>
  <table class="table">
    <thead>
      <tr>
        <th v-for="(header, i) in block.headers" :key="i">
          <ContentInlineRenderer :nodes="header" />
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, ri) in block.rows" :key="ri">
        <td v-for="(cell, ci) in row" :key="ci">
          <ContentInlineRenderer :nodes="cell" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
/**
 * TableBlock 组件 - 表格
 *
 * 表头和单元格内容均为 Inline[]，由 InlineRenderer 统一渲染。
 */
import type { TableBlock } from '@shared/lesson-ast'

defineProps<{ block: TableBlock }>()
</script>

<style scoped>
.table {
  width: 100%;
  margin: var(--spacing-md) 0;
  border-collapse: collapse;
  font-size: var(--text-sm);
}
th,
td {
  border: 1px solid var(--color-border);
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
}
th {
  background: var(--color-bg-secondary);
  font-weight: 600;
}
tr:nth-child(even) td {
  background: var(--color-bg-primary);
}
</style>
