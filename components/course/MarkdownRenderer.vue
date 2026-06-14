<template>
  <div class="markdown-body">
    <ContentRenderer
      v-if="document"
      :value="document"
    />

    <div
      v-else
      class="markdown-renderer__empty"
    >
      内容加载中...
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  document: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['rendered'])

watch(
  () => props.document,
  (document) => {
    if (!document?.toc?.links) return

    emit('rendered', {
      toc: document.toc.links,
    })
  },
  {
    immediate: true,
  },
)
</script>