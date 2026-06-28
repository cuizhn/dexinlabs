export interface Lesson {
  slug: string
  title: string
  description: string
  order?: number
  body?: unknown
  _path?: string
  [key: string]: unknown
}

export const LessonRepository = {
  async findBySlug(slug: string): Promise<Lesson | null> {
    try {
      return await $fetch<Lesson>(`/api/lesson/${slug}`)
    } catch {
      return null
    }
  },
}
