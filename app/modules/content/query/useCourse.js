export async function useCourse(options = {}) {
  const key = 'course:default'

  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => $fetch('/api/course'),
    {
      default: () => null,
      server: true,
      lazy: options.lazy ?? false,
      ...options
    }
  )

  return {
    course: data,
    loading: pending,
    error,
    refresh
  }
}
