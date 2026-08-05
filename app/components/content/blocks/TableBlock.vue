<template>
  <table class="block-table">
    <thead>
      <tr>
        <th v-for="(header, i) in block.headers" :key="i" v-html="renderInline(header)" />
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, ri) in block.rows" :key="ri">
        <td v-for="(cell, ci) in row" :key="ci" v-html="renderInline(cell)" />
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
/**
 * TableBlock 组件 - 表格
 *
 * 表头和单元格内容通过 renderInline 渲染行内 Markdown。
 */
import { renderInline } from '@markdown'
import type { TableBlock } from '@content/types/ast'

defineProps<{ block: TableBlock }>()
</script>

<style scoped>
.block-table {
  width: 100%;
  margin: 1em 0;
  border-collapse: collapse;
  font-size: 0.9375rem;
}
.block-table th,
.block-table td {
  border: 1px solid var(--color-border, #ddd);
  padding: 0.5em 0.75em;
  text-align: left;
}
.block-table th {
  background: var(--color-bg-secondary, #f8f9fa);
  font-weight: 600;
}
.block-table tr:nth-child(even) td {
  background: var(--color-bg-tertiary, #fafafa);
}
</style>
