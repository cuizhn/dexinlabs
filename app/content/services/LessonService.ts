import { lessonRepository } from '@content/repositories'
import type { Chapter, Lesson, LessonPage } from '../models/index'
import { normalizeSlug } from '../utils'
import { renderToHTML } from '@markdown'

export type LessonWithChapter = Omit<Lesson, 'chapter'> & {
  chapter: Chapter | null
}

export class LessonService {
  async listByChapter(chapterSlug: string): Promise<Lesson[]> {
    const clean = normalizeSlug(chapterSlug)
    if (!clean) return []
    return lessonRepository.listByChapter(clean)
  }

  async listAll(): Promise<Lesson[]> {
    return lessonRepository.list()
  }

  async getBySlug(slug: string): Promise<LessonWithChapter | null> {
    const clean = normalizeSlug(slug)
    if (!clean) return null
    const data = await lessonRepository.getWithChapterAndCourse(clean)
    if (!data) return null
    return { ...data, chapter: data.chapterEntity || null } as unknown as LessonWithChapter
  }

  async getLessonPage(slug: string): Promise<LessonPage | null> {
    const clean = normalizeSlug(slug)
    if (!clean) return null

    const data = await lessonRepository.getWithChapterAndCourse(clean)
    if (!data) return null

    const currentIndex = data.siblingLessons.findIndex(l => l.slug === data.slug)
    const previousLesson = currentIndex > 0 ? (data.siblingLessons[currentIndex - 1] || null) : null
    const nextLesson = currentIndex >= 0 && currentIndex < data.siblingLessons.length - 1
      ? (data.siblingLessons[currentIndex + 1] || null)
      : null

    const bodyHtml = data.body ? await renderToHTML(data.body) : ''
    const introHtml = data.intro ? await renderToHTML(data.intro) : ''
    const summaryHtml = data.summaryText ? await renderToHTML(data.summaryText) : ''

    return {
      lesson: { ...data, bodyHtml, introHtml, summaryHtml } as unknown as Lesson,
      chapter: data.chapterEntity || null,
      course: data.courseEntity || null,
      previousLesson,
      nextLesson
    }
  }
}

export const lessonService = new LessonService()
export default lessonService
