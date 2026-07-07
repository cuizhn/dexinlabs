import {
  chapterRepository,
  lessonRepository,
  exerciseRepository
} from '../repositories/index.js'

export class ChapterService {
  constructor({
    chapters = chapterRepository,
    lessons = lessonRepository,
    exercises = exerciseRepository
  } = {}) {
    this.chapters = chapters
    this.lessons = lessons
    this.exercises = exercises
  }

  async list(courseSlug) {
    if (!courseSlug) return this.chapters.list()
    return this.chapters.listByCourse(courseSlug)
  }

  async getBySlug(slug) {
    const chapter = await this.chapters.getBySlug(slug)
    if (!chapter) return null
    const lessons = await this.lessons.listByChapter(slug)
    const exercise = await this.exercises.getOneByChapter(slug)
    return {
      chapter,
      lessons,
      exercise: exercise || null
    }
  }
}

export const chapterService = new ChapterService()
export default chapterService
