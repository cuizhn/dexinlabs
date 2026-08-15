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
import type { TableBlock } from '@shared/lessonAST'

defineProps<{ block: TableBlock }>()
</script>

<style scoped>
/* booktabs 风格：仅靠粗细横线分节，无竖线、无底色、无 zebra */
.table {
  width: 100%;
  margin: 2rem 0;
  border-collapse: collapse;
  font-size: var(--text-sm);
  line-height: 1.6;
}
th,
td {
  border: none;
  padding: 0.625rem var(--spacing-md);
  text-align: left;
  background: none;
}
thead tr {
  border-top: 2px solid var(--color-border-strong);
  border-bottom: 1px solid var(--color-border-strong);
}
th {
  font-weight: 600;
  color: var(--color-heading);
}
tbody tr {
  border-bottom: 1px solid var(--color-border);
}
tbody tr:last-child {
  border-bottom: 2px solid var(--color-border-strong);
}
</style>
