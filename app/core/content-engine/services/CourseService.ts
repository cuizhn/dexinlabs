import {
  courseRepository,
  chapterRepository,
  lessonRepository
} from '@core/database/repositories'
import type { CourseRepository } from '@core/database/repositories'
import type { ChapterRepository, ChapterListByCourseRow } from '@core/database/repositories'
import type { LessonRepository, LessonListByChapterRow } from '@core/database/repositories'
import type { Course, Chapter, Lesson } from '../models/index'
import { queries } from '../queries/index'

type SelectCourse = Course
type SelectChapter = Chapter
type SelectLesson = Lesson

interface ChapterWithLessons extends ChapterListByCourseRow {
  lessons: (LessonListByChapterRow & { [key: string]: unknown })[]
}

type CourseWithChapters = SelectCourse & {
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
      chaptersAggregated.push({ ...chapter, lessons: lessons as unknown as ChapterWithLessons['lessons'] })
    }
    return { ...course, chapters: chaptersAggregated } as unknown as CourseWithChapters
  }

  async getBySlug(slug: string): Promise<CourseWithChapters | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    const course = await this.courses.getBySlug(q.slug)
    if (!course) return null
    const chapters = await this.chapters.listByCourse(course.slug)
    const chaptersAggregated: ChapterWithLessons[] = []
    for (const chapter of chapters) {
      const lessons = await this.lessons.listByChapter(chapter.slug)
      chaptersAggregated.push({ ...chapter, lessons: lessons as unknown as ChapterWithLessons['lessons'] })
    }
    return { ...course, chapters: chaptersAggregated } as unknown as CourseWithChapters
  }

  async create(data: Partial<SelectCourse> & { slug: string; title: string }): Promise<SelectCourse | null> {
    const q = queries.normalizeBySlug(data.slug)
    if (!q.isValid) throw new Error(q.error || 'slug is required')
    if (!String(data.title || '').trim()) throw new Error('title is required')
    const payload: typeof data = {
      ...data,
      slug: q.slug,
      title: String(data.title).trim(),
      summary: typeof data.summary === 'string' ? data.summary : null as unknown as typeof data.summary,
      cover: typeof data.cover === 'string' ? data.cover : null as unknown as typeof data.cover,
      edition: typeof data.edition === 'string' ? data.edition : null as unknown as typeof data.edition,
      body: typeof data.body === 'string' ? data.body : null as unknown as typeof data.body,
      order: typeof data.order === 'number' ? data.order : 0
    }
    return this.courses.create(payload as unknown as Parameters<typeof this.courses.create>[0])
  }

  async update(slug: string, patch: Partial<SelectCourse>): Promise<SelectCourse | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) throw new Error(q.error || 'slug is required')
    const existing = await this.courses.getBySlug(q.slug)
    if (!existing) return null
    const clean: Partial<SelectCourse> = {}
    const keysToCopy: (keyof SelectCourse)[] = ['title', 'summary', 'order', 'cover', 'edition', 'body']
    for (const k of keysToCopy) {
      if (patch[k] !== undefined) (clean as unknown as Record<string, unknown>)[k] = patch[k]
    }
    return this.courses.updateBySlug(q.slug, clean as unknown as Parameters<typeof this.courses.updateBySlug>[1])
  }

  async remove(slug: string): Promise<{ rowCount: number | null }> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) throw new Error(q.error || 'slug is required')
    return this.courses.deleteBySlug(q.slug)
  }
}

export const courseService = new CourseService()
export default courseService
