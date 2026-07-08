import {
  courseRepository,
  chapterRepository,
  lessonRepository
} from '../repositories/index.js'
import type { CourseRepository } from '../repositories/index.js'
import type { ChapterRepository, ChapterListByCourseRow } from '../repositories/index.js'
import type { LessonRepository, LessonListByChapterRow } from '../repositories/index.js'
import { courses, chapters, lessons } from '~~/drizzle/db'

type SelectCourse = typeof courses.$inferSelect
type SelectChapter = typeof chapters.$inferSelect
type SelectLesson = typeof lessons.$inferSelect

interface ChapterWithLessons extends ChapterListByCourseRow {
  lessons: LessonListByChapterRow[]
}

interface CourseWithChapters extends SelectCourse {
  chapters: ChapterWithLessons[]
}

export interface CourseServiceDeps {
  courses?: CourseRepository
  chapters?: ChapterRepository
  lessons?: LessonRepository
}

export class CourseService {
  courses: CourseRepository
  chapters: ChapterRepository
  lessons: LessonRepository

  constructor({ courses = courseRepository, chapters = chapterRepository, lessons = lessonRepository }: CourseServiceDeps = {}) {
    this.courses = courses
    this.chapters = chapters
    this.lessons = lessons
  }

  async list(): Promise<SelectCourse[]> {
    return this.courses.list()
  }

  async getDefault(): Promise<CourseWithChapters | null> {
    const course = await this.courses.getDefault()
    if (!course) return null
    const chapters = await this.chapters.listByCourse(course.slug)
    const chaptersAggregated: ChapterWithLessons[] = []
    for (const chapter of chapters) {
      const lessons = await this.lessons.listByChapter(chapter.slug)
      chaptersAggregated.push({ ...chapter, lessons })
    }
    return { ...course, chapters: chaptersAggregated }
  }

  async getBySlug(slug: string): Promise<CourseWithChapters | null> {
    const course = await this.courses.getBySlug(slug)
    if (!course) return null
    const chapters = await this.chapters.listByCourse(course.slug)
    const chaptersAggregated: ChapterWithLessons[] = []
    for (const chapter of chapters) {
      const lessons = await this.lessons.listByChapter(chapter.slug)
      chaptersAggregated.push({ ...chapter, lessons })
    }
    return { ...course, chapters: chaptersAggregated }
  }
}

export const courseService = new CourseService()
export default courseService
