import {
  lessonRepository,
  chapterRepository,
  courseRepository
} from '@core/database/repositories'
import type { LessonRepository, LessonListByChapterRow } from '@core/database/repositories'
import type { ChapterRepository } from '@core/database/repositories'
import type { CourseRepository } from '@core/database/repositories'
import type { Chapter, Lesson, Course } from '../models/index'
import { queries } from '../queries/index'

type SelectLesson = Lesson
type SelectChapter = Chapter

export type LessonWithChapter = Omit<SelectLesson, 'chapter'> & {
  chapter: SelectChapter | null
}

export interface LessonServiceDeps {
  lessons?: LessonRepository
  chapters?: ChapterRepository
  courses?: CourseRepository
}

export class LessonService {
  lessons: LessonRepository
  chapters: ChapterRepository
  courses: CourseRepository

  constructor({ lessons = lessonRepository, chapters = chapterRepository, courses = courseRepository }: LessonServiceDeps = {}) {
    this.lessons = lessons
    this.chapters = chapters
    this.courses = courses
  }

  async listByChapter(chapterSlug: string): Promise<LessonListByChapterRow[]> {
    const q = queries.normalizeByChapter(chapterSlug)
    if (!q.isValid) return []
    return this.lessons.listByChapter(q.chapterSlug || String(chapterSlug))
  }

  async getBySlug(slug: string): Promise<LessonWithChapter | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    const lesson = await this.lessons.getBySlug(q.slug)
    if (!lesson) return null
    let chapter: SelectChapter | null = null
    if (lesson.chapterId) {
      chapter = (await this.chapters.getById(lesson.chapterId)) || null
    }
    if (!chapter && lesson.chapter) {
      chapter = (await this.chapters.getBySlug(lesson.chapter)) || null
    }
    return { ...lesson, chapter }
  }

  async listAll(): Promise<SelectLesson[]> {
    return this.lessons.list()
  }

  async create(
    data: Partial<SelectLesson> & { slug: string; title: string }
  ): Promise<SelectLesson | null> {
    const q = queries.normalizeBySlug(data.slug)
    if (!q.isValid) throw new Error(q.error || 'slug is required')
    if (!String(data.title || '').trim()) throw new Error('title is required')
    const chapterQ = queries.normalizeByChapter({ chapterSlug: data.chapter, chapterId: data.chapterId })
    const chapterSlug = chapterQ.isValid && chapterQ.chapterSlug ? chapterQ.chapterSlug :
      (typeof data.chapter === 'string' ? data.chapter : undefined)
    const chapterId = chapterQ.isValid && chapterQ.chapterId ? chapterQ.chapterId :
      (data.chapterId !== undefined && data.chapterId !== null ? Number(data.chapterId) : undefined)
    const payload: Partial<SelectLesson> = {
      slug: q.slug,
      title: String(data.title).trim(),
      summary: typeof data.summary === 'string' ? data.summary : null as unknown as SelectLesson['summary'],
      objectives: typeof data.objectives === 'string' ? data.objectives : null as unknown as SelectLesson['objectives'],
      intro: typeof data.intro === 'string' ? data.intro : null as unknown as SelectLesson['intro'],
      body: typeof data.body === 'string' ? data.body : null as unknown as SelectLesson['body'],
      summaryText: typeof data.summaryText === 'string' ? data.summaryText : null as unknown as SelectLesson['summaryText'],
      notes: typeof data.notes === 'string' ? data.notes : null as unknown as SelectLesson['notes'],
      chapter: typeof chapterSlug === 'string' ? chapterSlug : null as unknown as SelectLesson['chapter'],
      chapterId: typeof chapterId === 'number' ? chapterId : null as unknown as SelectLesson['chapterId'],
      order: typeof data.order === 'number' ? data.order : 0
    }
    return this.lessons.create(payload as unknown as Parameters<typeof this.lessons.create>[0])
  }

  async update(slug: string, patch: Partial<SelectLesson>): Promise<SelectLesson | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) throw new Error(q.error || 'slug is required')
    const existing = await this.lessons.getBySlug(q.slug)
    if (!existing) return null
    const clean: Partial<SelectLesson> = {}
    const keys: (keyof SelectLesson)[] = [
      'title', 'summary', 'objectives', 'intro', 'body', 'summaryText', 'notes',
      'chapter', 'chapterId', 'order'
    ]
    for (const k of keys) {
      if ((patch as unknown as Record<string, unknown>)[k] !== undefined) {
        ;(clean as unknown as Record<string, unknown>)[k] = (patch as unknown as Record<string, unknown>)[k]
      }
    }
    return this.lessons.updateBySlug(q.slug, clean as unknown as Parameters<typeof this.lessons.updateBySlug>[1])
  }

  async remove(slug: string): Promise<{ rowCount: number | null }> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) throw new Error(q.error || 'slug is required')
    return this.lessons.deleteBySlug(q.slug)
  }

  async getLessonPage(slug: string): Promise<{
    lesson: SelectLesson
    chapter: SelectChapter | null
    course: Course | null
    previousLesson: SelectLesson | null
    nextLesson: SelectLesson | null
  } | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null

    const lesson = await this.lessons.getBySlug(q.slug)
    if (!lesson) return null

    let chapter: SelectChapter | null = null
    let course: Course | null = null
    let previousLesson: SelectLesson | null = null
    let nextLesson: SelectLesson | null = null

    if (lesson.chapterId) {
      chapter = (await this.chapters.getById(lesson.chapterId)) || null
    }
    if (!chapter && lesson.chapter) {
      chapter = (await this.chapters.getBySlug(lesson.chapter)) || null
    }

    if (chapter) {
      if (chapter.courseId) {
        course = (await this.courses.getById(chapter.courseId)) || null
      }
      if (!course && chapter.course) {
        course = (await this.courses.getBySlug(chapter.course)) || null
      }

      const lessonsInChapter = await this.lessons.listByChapter(chapter.slug)
      const currentIndex = lessonsInChapter.findIndex(l => l.slug === lesson.slug)
      if (currentIndex >= 0) {
        if (currentIndex > 0) {
          const prevItem = lessonsInChapter[currentIndex - 1]
          if (prevItem) {
            const prev = await this.lessons.getBySlug(prevItem.slug)
            if (prev) previousLesson = prev
          }
        }
        if (currentIndex < lessonsInChapter.length - 1) {
          const nextItem = lessonsInChapter[currentIndex + 1]
          if (nextItem) {
            const next = await this.lessons.getBySlug(nextItem.slug)
            if (next) nextLesson = next
          }
        }
      }
    }

    return {
      lesson,
      chapter,
      course,
      previousLesson,
      nextLesson
    }
  }
}

export const lessonService = new LessonService()
export default lessonService
