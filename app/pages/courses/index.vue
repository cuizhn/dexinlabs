<script setup>
import { useCourse } from '~/composables/course/useCourse'

const { courses, loadCourses } = useCourse()

await loadCourses()
</script>

<template>
  <div>
    <h1>课程列表</h1>

    <div v-for="c in courses" :key="c.id">
      <NuxtLink :to="`/courses/${c.slug}`">
        <h2>{{ c.icon }} {{ c.title }}</h2>
        <p>{{ c.description }}</p>
      </NuxtLink>
    </div>
  </div>
</template>