<template>
  <figure class="block-image">
    <img :src="block.src" :alt="block.alt" loading="lazy" />
    <figcaption v-if="block.caption">{{ block.caption }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
/**
 * ImageBlock 组件 - 图片
 */
import type { ImageBlock } from '@content/types/ast'

defineProps<{ block: ImageBlock }>()
</script>

<style scoped>
.block-image {
  margin: 1em 0;
  text-align: center;
}
.block-image img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}
.block-image figcaption {
  margin-top: 0.5em;
  font-size: 0.875rem;
  color: var(--color-text-secondary, #666);
}
</style>
