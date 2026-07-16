import { exerciseRepository } from '@database/repositories'
import type { Exercise } from '../models/index'
import { queries } from '../queries/index'

export class ExerciseService {
  async listByChapter(chapterSlug: string): Promise<Exercise[]> {
    const q = queries.normalizeByChapter(chapterSlug)
    if (!q.isValid) return []
    return exerciseRepository.listByChapter(q.chapterSlug || String(chapterSlug)) as unknown as Promise<Exercise[]>
  }

  async getBySlug(slug: string): Promise<Exercise | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    return exerciseRepository.getBySlug(q.slug) as unknown as Promise<Exercise | null>
  }

  async listAll(): Promise<Exercise[]> {
    return exerciseRepository.list() as unknown as Promise<Exercise[]>
  }
}

export const exerciseService = new ExerciseService()
export default exerciseService
