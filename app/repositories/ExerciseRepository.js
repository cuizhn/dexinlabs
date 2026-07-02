export const ExerciseRepository = {
  async findBySlug(slug) {
    try {
      return await $fetch(`/api/exercise/${slug}`)
    } catch {
      return null
    }
  }
}
