import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'

export async function useCoursePage(slug?: string, options: { lazy?: boolean } = {}) {
  const key = slug ? `course-page:${slug}` : 'course-page:default'

  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => $fetch('/api/course', { params: slug ? { slug } : {} }),
    {
      default: () => ({
        course: null,
        chapters: []
      }),
      server: true,
      lazy: options.lazy ?? false
    }
  )

  return {
    course: computed(() => (data.value as Record<string, unknown>)?.course ?? null),
    chapters: computed(() => (data.value as Record<string, unknown>)?.chapters ?? []),
    loading: pending,
    error,
    refresh
  }
}