import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'

export async function useLessonPage(slug: string, options: { lazy?: boolean } = {}) {
  const key = `lesson-page:${slug || 'empty'}`

  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => $fetch(`/api/lesson/${slug}`),
    {
      default: () => ({
        lesson: null,
        chapter: null,
        course: null,
        previousLesson: null,
        nextLesson: null
      }),
      server: true,
      lazy: options.lazy ?? false
    }
  )

  return {
    lesson: computed(() => (data.value as Record<string, unknown>)?.lesson ?? null),
    chapter: computed(() => (data.value as Record<string, unknown>)?.chapter ?? null),
    course: computed(() => (data.value as Record<string, unknown>)?.course ?? null),
    previousLesson: computed(() => (data.value as Record<string, unknown>)?.previousLesson ?? null),
    nextLesson: computed(() => (data.value as Record<string, unknown>)?.nextLesson ?? null),
    loading: pending,
    error,
    refresh
  }
}