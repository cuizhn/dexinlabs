/**
 * 课时服务 - 封装课时相关的业务逻辑
 *
 * 提供课时列表、课时详情、课时页面数据组装（含前后课时导航和 Markdown 渲染）等功能。
 */
import { lessonRepository } from '@content/repositories'
import { renderToHTML } from '@markdown'
import type { Chapter, Lesson, LessonPage } from '../models/index'
import { normalizeSlug } from '../utils'

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

    // 将 Markdown 字段渲染为 HTML，供前端直接展示
    const [bodyHtml, introHtml, summaryHtml] = await Promise.all([
      data.body ? renderToHTML(data.body) : '',
      data.intro ? renderToHTML(data.intro) : '',
      data.summaryText ? renderToHTML(data.summaryText) : ''
    ])

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
