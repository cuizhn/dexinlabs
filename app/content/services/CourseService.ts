import {
  courseRepository,
  chapterRepository,
  lessonRepository
} from '@database/repositories'
import type { Course, Chapter, Lesson } from '../models/index'
import type { CoursePage } from '../dto/index'
import { queries } from '../queries/index'

export class CourseService {
  async list(): Promise<Course[]> {
    return courseRepository.list()
  }

  async getDefault(): Promise<CoursePage | null> {
    const course = await courseRepository.getDefault()
    if (!course) return null
    return this.buildCoursePage(course)
  }

  async getBySlug(slug: string): Promise<CoursePage | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null

    const course = await courseRepository.getBySlug(q.slug)
    if (!course) return null
    return this.buildCoursePage(course)
  }

  async getCoursePage(slug: string): Promise<CoursePage | null> {
    return this.getBySlug(slug)
  }

  private async buildCoursePage(course: Course): Promise<CoursePage> {
    const chapters = await chapterRepository.listByCourse(course.slug)
    const chaptersWithLessons: Chapter[] = []

    for (const chapter of chapters) {
      const lessons = await lessonRepository.listByChapter(chapter.slug)
      chaptersWithLessons.push({ ...chapter, lessons: lessons as unknown as Lesson[] } as unknown as Chapter)
    }

    return {
      course,
      chapters: chaptersWithLessons
    }
  }
}

export const courseService = new CourseService()
export default courseService
