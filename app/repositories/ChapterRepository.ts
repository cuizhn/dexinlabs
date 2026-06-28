export interface Chapter {
  id: string
  slug: string
  title: string
  description?: string
  order: number
  lessons: unknown[]
  exercise?: unknown | null
  [key: string]: unknown
}

export interface ChapterListItem {
  id: string
  slug: string
  title: string
  description?: string
  order: number
  [key: string]: unknown
}

export const ChapterRepository = {
  async findAll(courseSlug?: string): Promise<ChapterListItem[]> {
    try {
      const params: Record<string, string> = {}
      if (courseSlug) params.course = courseSlug
      return await $fetch<ChapterListItem[]>('/api/chapter', { params })
    } catch {
      return []
    }
  },

  async findBySlug(slug: string): Promise<Chapter | null> {
    try {
      return await $fetch<Chapter>(`/api/chapter/${slug}`)
    } catch {
      return null
    }
  },
}
