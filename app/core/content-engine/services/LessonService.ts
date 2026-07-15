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
