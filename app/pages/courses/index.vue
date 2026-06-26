<script setup>
import { useChapter } from '~/features/course/composables/useChapter.js'

const { chapters, loadChapters } = useChapter()

await loadChapters()
</script>

<template>
  <div>
    <h1>课程列表</h1>

    <div v-for="c in chapters" :key="c.id">
      <NuxtLink :to="`/chapters/${c.slug}`">
        <h2>{{ c.title }}</h2>
        <p>{{ c.description }}</p>
      </NuxtLink>
    </div>
  </div>
</template>