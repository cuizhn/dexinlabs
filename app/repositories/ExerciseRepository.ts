export interface Exercise {
  slug: string
  title: string
  description?: string
  questions?: unknown[]
  [key: string]: unknown
}

export const ExerciseRepository = {
  async findBySlug(slug: string): Promise<Exercise | null> {
    try {
      return await $fetch<Exercise>(`/api/exercise/${slug}`)
    } catch {
      return null
    }
  },
}
