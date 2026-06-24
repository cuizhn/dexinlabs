<script setup>
import { useCourse } from '~/composables/useCourse'

const route = useRoute()

const { getCourse } = useCourse()

const { data: course } =
  await useAsyncData(
    `course-${route.params.slug}`,
    () => getCourse(route.params.slug)
  )

if (!course.value) {
  throw createError({
    statusCode: 404,
    statusMessage: '课程不存在'
  })
}
</script>

<template>
  <div>

    <h1>{{ course.title }}</h1>

    <p>
      {{ course.description }}
    </p>

    <div
      v-for="chapter in course.chapters"
      :key="chapter.slug"
    >
      <NuxtLink
        :to="`/courses/${course.id}/${chapter.slug}`"
      >
        {{ chapter.title }}
      </NuxtLink>
    </div>

  </div>
</template>