<script setup>
import { useCourse } from '~/composables/course/useCourse'

const { getAllCourses } = useCourse()

const { data: courses } =
  await useAsyncData(
    'courses',
    () => getAllCourses()
  )

console.log(courses.value)
</script>

<template>
  <pre>{{ courses }}</pre>
</template>