import {
  lessonRepository,
  chapterRepository
} from '@core/database/repositories'
import type { LessonRepository, LessonListByChapterRow } from '@core/database/repositories'
import type { ChapterRepository } from '@core/database/repositories'
import type { Chapter, Lesson } from '../models/index'
import { queries } from '../queries/index'

type SelectLesson = Lesson
type SelectChapter = Chapter

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
}

export const lessonService = new LessonService()
export default lessonService
