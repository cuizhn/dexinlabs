import {
  lessonRepository,
  chapterRepository
} from '../repositories/index.js'

export class LessonService {
  constructor({ lessons = lessonRepository, chapters = chapterRepository } = {}) {
    this.lessons = lessons
    this.chapters = chapters
  }

  async listByChapter(chapterSlug) {
    return this.lessons.listByChapter(chapterSlug)
  }

  async getBySlug(slug) {
    const lesson = await this.lessons.getBySlug(slug)
    if (!lesson) return null
    let chapter = null
    if (lesson.chapterId) {
      chapter = (await this.chapters.getById(lesson.chapterId)) || null
    }
    if (!chapter && lesson.chapter) {
      chapter = (await this.chapters.getBySlug(lesson.chapter)) || null
    }
    return { ...lesson, chapter }
  }
}

export const lessonService = new LessonService()
export default lessonService
