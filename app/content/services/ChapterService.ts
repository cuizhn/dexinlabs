import {
  chapterRepository,
  lessonRepository,
  exerciseRepository,
  courseRepository
} from '@database/repositories'
import type { Chapter, Lesson, Exercise, Course, ChapterPage } from '../models/index'
import { queries } from '../queries/index'

export class ChapterService {
  async list(courseSlug?: string): Promise<Chapter[]> {
    const q = queries.normalizeListChapters(courseSlug || {})
    if (!courseSlug) return chapterRepository.list() as unknown as Chapter[]
    return chapterRepository.listByCourse(q.courseSlug || courseSlug) as unknown as Chapter[]
  }

  async getBySlug(slug: string): Promise<ChapterPage | null> {
    return this.getChapterPage(slug)
  }

  async listAll(): Promise<Chapter[]> {
    return chapterRepository.list()
  }

  async getChapterPage(slug: string): Promise<ChapterPage | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null

    const chapter = await chapterRepository.getBySlug(q.slug)
    if (!chapter) return null

    let course: Course | null = null
    let previousChapter: Chapter | null = null
    let nextChapter: Chapter | null = null

    if (chapter.courseId) {
      course = (await courseRepository.getById(chapter.courseId)) || null
    }
    if (!course && chapter.course) {
      course = (await courseRepository.getBySlug(chapter.course)) || null
    }

    const lessons = await lessonRepository.listByChapter(chapter.slug)
    const exercise = await exerciseRepository.getOneByChapter(chapter.slug)

    if (course) {
      const chaptersInCourse = await chapterRepository.listByCourse(course.slug)
      const currentIndex = chaptersInCourse.findIndex(c => c.slug === chapter.slug)

      if (currentIndex >= 0) {
        if (currentIndex > 0) {
          const prevItem = chaptersInCourse[currentIndex - 1]
          if (prevItem) {
            const prev = await chapterRepository.getBySlug(prevItem.slug)
            if (prev) previousChapter = prev
          }
        }
        if (currentIndex < chaptersInCourse.length - 1) {
          const nextItem = chaptersInCourse[currentIndex + 1]
          if (nextItem) {
            const next = await chapterRepository.getBySlug(nextItem.slug)
            if (next) nextChapter = next
          }
        }
      }
    }

    return {
      chapter,
      course,
      lessons: lessons as unknown as Lesson[],
      exercise: (exercise || null) as unknown as Exercise | null,
      previousChapter,
      nextChapter
    }
  }
}

export const chapterService = new ChapterService()
export default chapterService
