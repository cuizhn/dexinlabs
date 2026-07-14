import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'

export async function useChapterPage(slug: string, options: { lazy?: boolean } = {}) {
  const key = `chapter-page:${slug || 'empty'}`

  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => $fetch(`/api/chapter/${slug}`),
    {
      default: () => ({
        chapter: null,
        course: null,
        lessons: [],
        exercise: null,
        previousChapter: null,
        nextChapter: null
      }),
      server: true,
      lazy: options.lazy ?? false
    }
  )

  return {
    chapter: computed(() => (data.value as Record<string, unknown>)?.chapter ?? null),
    course: computed(() => (data.value as Record<string, unknown>)?.course ?? null),
    lessons: computed(() => (data.value as Record<string, unknown>)?.lessons ?? []),
    exercise: computed(() => (data.value as Record<string, unknown>)?.exercise ?? null),
    previousChapter: computed(() => (data.value as Record<string, unknown>)?.previousChapter ?? null),
    nextChapter: computed(() => (data.value as Record<string, unknown>)?.nextChapter ?? null),
    loading: pending,
    error,
    refresh
  }
}