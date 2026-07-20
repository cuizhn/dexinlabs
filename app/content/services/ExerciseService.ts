import { exerciseRepository } from '@content/repositories'
import type { Exercise } from '../models/index'
import { normalizeSlug } from '../utils'

export class ExerciseService {
  async listByChapter(chapterSlug: string): Promise<Exercise[]> {
    const clean = normalizeSlug(chapterSlug)
    if (!clean) return []
    return exerciseRepository.listByChapter(clean)
  }

  async getBySlug(slug: string): Promise<Exercise | null> {
    const clean = normalizeSlug(slug)
    if (!clean) return null
    return exerciseRepository.getBySlug(clean)
  }

  async listAll(): Promise<Exercise[]> {
    return exerciseRepository.list()
  }
}

export const exerciseService = new ExerciseService()
export default exerciseService
