export const LessonRepository = {
  async findBySlug(slug) {
    try {
      return await $fetch(`/api/lesson/${slug}`)
    } catch {
      return null
    }
  }
}
