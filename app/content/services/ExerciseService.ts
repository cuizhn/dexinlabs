import { exerciseRepository } from '@database/repositories'
import type { ExerciseListByChapterRow } from '@database/repositories'
import type { Exercise } from '../models/index'
import { queries } from '../queries/index'

export class ExerciseService {
  async listByChapter(chapterSlug: string): Promise<ExerciseListByChapterRow[]> {
    const q = queries.normalizeByChapter(chapterSlug)
    if (!q.isValid) return []
    return exerciseRepository.listByChapter(q.chapterSlug || String(chapterSlug))
  }

  async getBySlug(slug: string): Promise<Exercise | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    return exerciseRepository.getBySlug(q.slug)
  }

  async listAll(): Promise<Exercise[]> {
    return exerciseRepository.list()
  }
}

export const exerciseService = new ExerciseService()
export default exerciseService
