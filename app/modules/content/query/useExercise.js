export async function useExercise(slug, options = {}) {
  const key = `exercise:${slug || 'empty'}`

  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => (slug ? $fetch(`/api/exercise/${slug}`) : null),
    {
      default: () => null,
      server: true,
      lazy: options.lazy ?? false,
      ...options
    }
  )

  return {
    exercise: data,
    loading: pending,
    error,
    refresh
  }
}
