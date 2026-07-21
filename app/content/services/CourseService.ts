import { courseRepository } from '@content/repositories'
import type { Course, Chapter, Lesson, CoursePage } from '../models/index'
import { normalizeSlug } from '../utils'

export class CourseService {
  async list(): Promise<Course[]> {
    return courseRepository.list()
  }

  async getDefault(): Promise<CoursePage | null> {
    const defaultCourse = await courseRepository.getDefault()
    if (!defaultCourse) return null
    const course = await courseRepository.getWithChaptersAndLessons(defaultCourse.slug)
    if (!course) return null
    return this.buildCoursePage(course)
  }

  async getBySlug(slug: string): Promise<CoursePage | null> {
    const clean = normalizeSlug(slug)
    if (!clean) return null
    const course = await courseRepository.getWithChaptersAndLessons(clean)
    if (!course) return null
    return this.buildCoursePage(course)
  }

  async getCoursePage(slug: string): Promise<CoursePage | null> {
    return this.getBySlug(slug)
  }

  private buildCoursePage(
    course: Course & { chapters?: (Chapter & { lessons?: Lesson[] })[] }
  ): CoursePage {
    const chapters = (course.chapters || []).map(ch => ({
      ...ch,
      lessons: (ch.lessons || []).map(l => ({ ...l }))
    }))

    return {
      course: { ...course },
      chapters
    }
  }
}

export const courseService = new CourseService()
export default courseService
