import {
  lessonRepository,
  chapterRepository,
  courseRepository
} from '@database/repositories'
import type { LessonListByChapterRow } from '@database/repositories'
import type { Chapter, Lesson, Course } from '../models/index'
import { queries } from '../queries/index'

export type LessonWithChapter = Omit<Lesson, 'chapter'> & {
  chapter: Chapter | null
}

export class LessonService {
  async listByChapter(chapterSlug: string): Promise<LessonListByChapterRow[]> {
    const q = queries.normalizeByChapter(chapterSlug)
    if (!q.isValid) return []
    return lessonRepository.listByChapter(q.chapterSlug || String(chapterSlug))
  }

  async getBySlug(slug: string): Promise<LessonWithChapter | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    
    const lesson = await lessonRepository.getBySlug(q.slug)
    if (!lesson) return null
    
    let chapter: Chapter | null = null
    
    if (lesson.chapterId) {
      chapter = (await chapterRepository.getById(lesson.chapterId)) || null
    }
    if (!chapter && lesson.chapter) {
      chapter = (await chapterRepository.getBySlug(lesson.chapter)) || null
    }
    
    return { ...lesson, chapter }
  }

  async listAll(): Promise<Lesson[]> {
    return lessonRepository.list()
  }

  async getLessonPage(slug: string): Promise<{
    lesson: Lesson
    chapter: Chapter | null
    course: Course | null
    previousLesson: Lesson | null
    nextLesson: Lesson | null
  } | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null

    const lesson = await lessonRepository.getBySlug(q.slug)
    if (!lesson) return null

    let chapter: Chapter | null = null
    let course: Course | null = null
    let previousLesson: Lesson | null = null
    let nextLesson: Lesson | null = null

    if (lesson.chapterId) {
      chapter = (await chapterRepository.getById(lesson.chapterId)) || null
    }
    if (!chapter && lesson.chapter) {
      chapter = (await chapterRepository.getBySlug(lesson.chapter)) || null
    }

    if (chapter) {
      if (chapter.courseId) {
        course = (await courseRepository.getById(chapter.courseId)) || null
      }
      if (!course && chapter.course) {
        course = (await courseRepository.getBySlug(chapter.course)) || null
      }

      const lessonsInChapter = await lessonRepository.listByChapter(chapter.slug)
      const currentIndex = lessonsInChapter.findIndex(l => l.slug === lesson.slug)

      if (currentIndex >= 0) {
        if (currentIndex > 0) {
          const prevItem = lessonsInChapter[currentIndex - 1]
          if (prevItem) {
            const prev = await lessonRepository.getBySlug(prevItem.slug)
            if (prev) previousLesson = prev
          }
        }
        if (currentIndex < lessonsInChapter.length - 1) {
          const nextItem = lessonsInChapter[currentIndex + 1]
          if (nextItem) {
            const next = await lessonRepository.getBySlug(nextItem.slug)
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
