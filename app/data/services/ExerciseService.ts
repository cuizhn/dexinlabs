import { exerciseRepository } from '../repositories/index.js'
import type { ExerciseRepository, ExerciseListByChapterRow } from '../repositories/index.js'
import { exercises } from '~~/drizzle/db'

type SelectExercise = typeof exercises.$inferSelect

export interface ExerciseServiceDeps {
  exercises?: ExerciseRepository
}

export class ExerciseService {
  exercises: ExerciseRepository

  constructor({ exercises = exerciseRepository }: ExerciseServiceDeps = {}) {
    this.exercises = exercises
  }

  async listByChapter(chapterSlug: string): Promise<ExerciseListByChapterRow[]> {
    return this.exercises.listByChapter(chapterSlug)
  }

  async getBySlug(slug: string): Promise<SelectExercise | null> {
    return this.exercises.getBySlug(slug)
  }
}

export const exerciseService = new ExerciseService()
export default exerciseService
