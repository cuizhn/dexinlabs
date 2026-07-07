import {
  courseRepository,
  chapterRepository,
  lessonRepository
} from '../repositories/index.js'

export class CourseService {
  constructor({ courses = courseRepository, chapters = chapterRepository, lessons = lessonRepository } = {}) {
    this.courses = courses
    this.chapters = chapters
    this.lessons = lessons
  }

  async list() {
    return this.courses.list()
  }

  async getDefault() {
    const course = await this.courses.getDefault()
    if (!course) return null
    const chapters = await this.chapters.listByCourse(course.slug)
    const chaptersAggregated = []
    for (const chapter of chapters) {
      const lessons = await this.lessons.listByChapter(chapter.slug)
      chaptersAggregated.push({ ...chapter, lessons })
    }
    return { ...course, chapters: chaptersAggregated }
  }

  async getBySlug(slug) {
    const course = await this.courses.getBySlug(slug)
    if (!course) return null
    const chapters = await this.chapters.listByCourse(course.slug)
    const chaptersAggregated = []
    for (const chapter of chapters) {
      const lessons = await this.lessons.listByChapter(chapter.slug)
      chaptersAggregated.push({ ...chapter, lessons })
    }
    return { ...course, chapters: chaptersAggregated }
  }
}

export const courseService = new CourseService()
export default courseService
