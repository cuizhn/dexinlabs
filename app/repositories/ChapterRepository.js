export const ChapterRepository = {
  async findAll() {
    try {
      const params = {}

      return await $fetch('/api/chapter', { params })
    } catch {
      return []
    }
  },

  async findBySlug(slug) {
    try {
      return await $fetch(`/api/chapter/${slug}`)
    } catch {
      return null
    }
  }
}
