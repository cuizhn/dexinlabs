import { courseRepository } from '@content/repositories'
import type { Course, Chapter, Lesson, CoursePage } from '../models/index'
import { normalizeSlug } from '../utils'
import { renderToHTML } from '@markdown'

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

  private async buildCoursePage(
    course: Course & { chapters?: (Chapter & { lessons?: Lesson[] })[] }
  ): Promise<CoursePage> {
    const courseBodyHtml = course.body ? await renderToHTML(course.body) : ''

    const chapters = await Promise.all((course.chapters || []).map(async ch => {
      const chapterBodyHtml = ch.body ? await renderToHTML(ch.body) : ''
      const lessons = await Promise.all((ch.lessons || []).map(async l => ({
        ...l,
        body: l.body ? await renderToHTML(l.body) : '',
        intro: l.intro ? await renderToHTML(l.intro) : ''
      })))
      return { ...ch, body: chapterBodyHtml, lessons }
    }))

    return {
      course: { ...course, body: courseBodyHtml },
      chapters
    }
  }
}

export const courseService = new CourseService()
export default courseService
