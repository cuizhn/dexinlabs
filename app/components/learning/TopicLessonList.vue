<template>
  <div class="mb-8">
    <h3 class="text-lg font-semibold text-text-primary mb-4">{{ title }}</h3>

    <ol class="list-none p-0 m-0 flex flex-col gap-2">
      <li
        v-for="(lesson, idx) in lessons"
        :key="lesson.slug"
        :class="{ 'border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.02)]': getLessonState(lesson.slug).isCompleted }"
        class="flex items-center gap-4 p-4 bg-bg-white border border-border rounded-md transition-all duration-150 hover:border-primary hover:shadow-sm"
      >
        <NuxtLink :to="`/${domainSlug}/${topicSlug}/${lesson.slug}`" class="flex items-center gap-4 w-full no-underline text-inherit">
          <span
            class="font-mono font-semibold text-sm text-primary min-w-[2.25rem] text-center"
            :class="{ 'text-[#16a34a]': getLessonState(lesson.slug).isCompleted }"
          >
            <template v-if="getLessonState(lesson.slug).isCompleted">✓</template>
            <template v-else>{{ String(idx + 1).padStart(2, '0') }}</template>
          </span>

          <div class="flex-1 min-w-0 flex flex-col gap-1">
            <span class="font-semibold text-text-primary">{{ lesson.title }}</span>
            <span v-if="lesson.summary" class="text-sm text-text-secondary leading-[1.5]">{{ lesson.summary }}</span>
          </div>

          <span class="text-text-light font-medium transition-transform duration-150 group-hover:translate-x-1 hover:text-primary">→</span>
        </NuxtLink>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { useLearningState } from '~/composables/useLearningState'

interface LessonItem {
  slug: string
  title: string
  summary?: string | null
}

defineProps<{
  lessons: LessonItem[]
  domainSlug: string
  topicSlug: string
  title?: string
}>()

const { getLessonState } = useLearningState()
</script>
