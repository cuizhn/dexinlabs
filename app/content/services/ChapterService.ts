import { chapterRepository } from '@content/repositories'
import type { Chapter, ChapterPage } from '../models/index'
import { normalizeSlug } from '../utils'
import { renderToHTML } from '@markdown'

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

    const bodyHtml = data.body ? await renderToHTML(data.body) : ''

    const lessonsWithHtml = await Promise.all((data.lessonList || []).map(async l => ({
      ...l,
      body: l.body ? await renderToHTML(l.body) : '',
      intro: l.intro ? await renderToHTML(l.intro) : ''
    })))

    return {
      chapter: { ...data, body: bodyHtml } as unknown as Chapter,
      course: data.courseEntity || null,
      lessons: lessonsWithHtml,
      exercise: data.exerciseEntity || null,
      previousChapter,
      nextChapter
    }
  }
}

export const chapterService = new ChapterService()
export default chapterService
