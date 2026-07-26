<template>
  <div class="min-h-screen bg-bg-primary">
    <div class="grid grid-cols-[280px_1fr_280px] gap-6 px-6 py-8 max-w-[1600px] mx-auto lg:grid-cols-[240px_1fr] md:grid-cols-1 md:px-4">
      <aside class="sticky top-[calc(2rem+64px)] h-fit hidden md:block">
        <LearningLessonChecklist />
      </aside>

      <main class="min-w-0">
        <article class="bg-bg-white border border-border rounded-xl p-8">
          <header class="flex justify-between items-center mb-8">
            <NuxtLink :to="`/${route.params.domain}/${route.params.topic}`" class="inline-flex items-center gap-[6px] text-[0.9375rem] text-text-secondary no-underline transition-colors duration-150 hover:text-primary">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 13l-3-3 3-3M7 10h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ data?.topic?.title }}
            </NuxtLink>
            <div class="flex gap-3">
              <span class="text-sm text-text-light px-3 py-1 bg-bg-secondary rounded-md">第 {{ data?.lesson?.order }} 课</span>
            </div>
          </header>

          <h1 class="text-[1.75rem] font-extrabold text-text-primary mb-6 md:text-[1.375rem]">{{ data?.lesson?.title }}</h1>

          <div v-if="data?.lesson?.intro" class="mb-8 pb-8 border-b border-border">
            <ContentRenderer :value="{ body: data.lesson.intro }" content="" />
          </div>

          <div class="lesson-content">
            <ContentRenderer :value="{ body: data?.lesson?.body }" content="" />
          </div>

          <div v-if="data?.lesson?.summaryText" class="mt-8 pt-8 border-t border-border">
            <ContentRenderer :value="{ body: data.lesson.summaryText }" content="" />
          </div>

          <nav class="flex justify-between mt-8 pt-6 border-t border-border md:flex-col md:gap-3">
            <NuxtLink
              v-if="data?.previousLesson"
              :to="`/${route.params.domain}/${route.params.topic}/${data.previousLesson.slug}`"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-[0.9375rem] no-underline text-text-secondary bg-bg-white border border-border transition-all duration-250 hover:border-primary hover:text-primary md:w-full md:justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 13l-3-3 3-3M7 10h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>{{ data.previousLesson.title }}</span>
            </NuxtLink>

            <NuxtLink
              v-if="data?.nextLesson"
              :to="`/${route.params.domain}/${route.params.topic}/${data.nextLesson.slug}`"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-[0.9375rem] no-underline text-white bg-gradient-to-br from-primary to-[#6366F1] shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(79,70,229,0.4)] md:w-full md:justify-center"
            >
              <span>{{ data.nextLesson.title }}</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M6 10h8M10 6l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </NuxtLink>
          </nav>
        </article>
      </main>

      <aside class="sticky top-[calc(2rem+64px)] h-fit hidden lg:block">
        <LearningLessonAssistant />
        <LearningMyUnderstanding :lesson-slug="lessonSlug" />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLearningState } from '~/composables/useLearningState'

const route = useRoute()
const lessonSlug = route.params.lesson as string
const topicSlug = route.params.topic as string
const domainSlug = route.params.domain as string

const { lesson, topic, previousLesson, nextLesson } = await useLessonPage(lessonSlug)

const data = computed(() => {
  if (!lesson.value) return null
  return {
    lesson: lesson.value,
    topic: topic.value,
    previousLesson: previousLesson.value,
    nextLesson: nextLesson.value
  }
})

const { recordLesson } = useLearningState()

onMounted(() => {
  if (topic.value && lesson.value) {
    recordLesson({
      topicSlug: domainSlug,
      topicTitle: topic.value.title,
      lessonSlug: lessonSlug,
      lessonTitle: lesson.value.title,
      lessonIndex: lesson.value.order,
      totalLessons: 0
    })
  }
})

useHead({
  title: computed(() => data.value?.lesson.title || '学习课时')
})
</script>
