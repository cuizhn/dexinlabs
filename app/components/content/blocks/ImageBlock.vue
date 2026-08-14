<template>
  <figure class="image">
    <img :src="block.src" :alt="block.alt" loading="lazy" />
    <figcaption v-if="block.caption">{{ block.caption }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
/**
 * ImageBlock 组件 - 图片
 */
import type { ImageBlock } from '@shared/lesson-ast'

defineProps<{ block: ImageBlock }>()
</script>

<style scoped>
.image {
  margin: var(--spacing-md) 0;
  text-align: center;
}
img {
  max-width: 100%;
  height: auto;
  border-radius: var(--border-radius-sm);
}
figcaption {
  margin-top: var(--spacing-sm);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
</style>
