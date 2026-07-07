export async function useLesson(slug, options = {}) {
  const key = `lesson:${slug || 'empty'}`

  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => (slug ? $fetch(`/api/lesson/${slug}`) : null),
    {
      default: () => null,
      server: true,
      lazy: options.lazy ?? false,
      ...options
    }
  )

  return {
    lesson: data,
    loading: pending,
    error,
    refresh
  }
}
