import { chapterRepository } from '@content/repositories'
import type { Chapter, ChapterPage } from '../models/index'
import { normalizeSlug } from '../utils'

export class ChapterService {
  async list(courseSlug?: string): Promise<Chapter[]> {
    if (!courseSlug) return chapterRepository.list()
    const clean = normalizeSlug(courseSlug)
    if (!clean) return []
    return chapterRepository.listByCourse(clean)
  }

  async getBySlug(slug: string): Promise<ChapterPage | null> {
    return this.getChapterPage(slug)
  }

  async getChapterPage(slug: string): Promise<ChapterPage | null> {
    const clean = normalizeSlug(slug)
    if (!clean) return null

    const data = await chapterRepository.getWithLessonsAndCourse(clean)
    if (!data) return null

    const currentIndex = data.siblingChapters.findIndex(c => c.slug === data.slug)
    const previousChapter = currentIndex > 0 ? (data.siblingChapters[currentIndex - 1] || null) : null
    const nextChapter = currentIndex >= 0 && currentIndex < data.siblingChapters.length - 1
      ? (data.siblingChapters[currentIndex + 1] || null)
      : null

    const lessons = (data.lessonList || []).map(l => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      summary: l.summary,
      order: l.order
    }))

    return {
      chapter: data as unknown as Chapter,
      course: data.courseEntity || null,
      lessons,
      exercise: data.exerciseEntity || null,
      previousChapter,
      nextChapter
    }
  }
}

export const chapterService = new ChapterService()
export default chapterService
