import {
  lessonRepository,
  chapterRepository
} from '../repositories/index.js'
import type { LessonRepository, LessonListByChapterRow } from '../repositories/index.js'
import type { ChapterRepository } from '../repositories/index.js'
import { lessons, chapters } from '~~/drizzle/db'

type SelectLesson = typeof lessons.$inferSelect
type SelectChapter = typeof chapters.$inferSelect

export type LessonWithChapter = Omit<SelectLesson, 'chapter'> & {
  chapter: SelectChapter | null
}

export interface LessonServiceDeps {
  lessons?: LessonRepository
  chapters?: ChapterRepository
}

export class LessonService {
  lessons: LessonRepository
  chapters: ChapterRepository

  constructor({ lessons = lessonRepository, chapters = chapterRepository }: LessonServiceDeps = {}) {
    this.lessons = lessons
    this.chapters = chapters
  }

  async listByChapter(chapterSlug: string): Promise<LessonListByChapterRow[]> {
    return this.lessons.listByChapter(chapterSlug)
  }

  async getBySlug(slug: string): Promise<LessonWithChapter | null> {
    const lesson = await this.lessons.getBySlug(slug)
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
}

export const lessonService = new LessonService()
export default lessonService
