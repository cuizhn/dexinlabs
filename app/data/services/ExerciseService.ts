import { exerciseRepository } from '../repositories/index.js'
import type { ExerciseRepository, ExerciseListByChapterRow } from '../repositories/index.js'
import type { Exercise } from '../../../content-engine/models/index'
import { queries } from '../../../content-engine/queries/index'

type SelectExercise = Exercise

export interface ExerciseServiceDeps {
  exercises?: ExerciseRepository
}

export class ExerciseService {
  exercises: ExerciseRepository

  constructor({ exercises = exerciseRepository }: ExerciseServiceDeps = {}) {
    this.exercises = exercises
  }

  async listByChapter(chapterSlug: string): Promise<ExerciseListByChapterRow[]> {
    const q = queries.normalizeByChapter(chapterSlug)
    if (!q.isValid) return []
    return this.exercises.listByChapter(q.chapterSlug || String(chapterSlug))
  }

  async getBySlug(slug: string): Promise<SelectExercise | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    return this.exercises.getBySlug(q.slug)
  }
}

export const exerciseService = new ExerciseService()
export default exerciseService
