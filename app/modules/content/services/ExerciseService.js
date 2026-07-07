import { exerciseRepository } from '../repositories/index.js'

export class ExerciseService {
  constructor({ exercises = exerciseRepository } = {}) {
    this.exercises = exercises
  }

  async listByChapter(chapterSlug) {
    return this.exercises.listByChapter(chapterSlug)
  }

  async getBySlug(slug) {
    return this.exercises.getBySlug(slug)
  }
}

export const exerciseService = new ExerciseService()
export default exerciseService
