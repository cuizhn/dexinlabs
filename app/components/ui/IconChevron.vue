<template>
  <svg :width="size" :height="size" viewBox="0 0 20 20" fill="none">
    <path
      v-if="direction === 'left'"
      d="M10 13l-3-3 3-3M7 10h6"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      v-else
      d="M6 10h8M10 6l4 4-4 4"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
/**
 * IconChevron - 箭头图标组件
 * 
 * 用于返回、上一课、下一课等导航场景
 */
defineProps<{
  /** 箭头方向 */
  direction?: 'left' | 'right'
  /** 图标尺寸（px） */
  size?: number
}>()
</script>
