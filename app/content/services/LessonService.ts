/**
 * 课时服务 - 封装课时相关的业务逻辑
 *
 * 提供课时列表、课时详情、课时页面数据组装（含前后课时导航和 Markdown 渲染）等功能。
 * Service 负责将 Markdown 渲染为 HTML 字段（introHtml/bodyHtml/summaryHtml），
 * HTML 段落的页面级组合由 Page 层决定。
 */
import { lessonRepository } from '@content/repositories'
import { renderToHTML } from '@markdown'
import type { Lesson, LessonPage } from '../types/index'
import { normalizeSlug, toLesson, toTopic, toDomain, getSiblings } from '../utils'

export class LessonService {
  async listByTopic(topicSlug: string): Promise<Lesson[]> {
    const clean = normalizeSlug(topicSlug)
    if (!clean) return []
    return lessonRepository.listByTopic(clean)
  }

  async listAll(): Promise<Lesson[]> {
    return lessonRepository.list()
  }

  async getLessonPage(slug: string): Promise<LessonPage | null> {
    const clean = normalizeSlug(slug)
    if (!clean) return null

    const data = await lessonRepository.getWithTopicAndDomain(clean)
    if (!data) return null

    // 使用 getSiblings 工具函数计算前后课时导航
    const { previous: previousLesson, next: nextLesson } = getSiblings(data.siblingLessons, data.slug)

    // 将 Markdown 字段渲染为 HTML
    const [bodyHtml, introHtml, summaryHtml] = await Promise.all([
      data.body ? renderToHTML(data.body) : '',
      data.intro ? renderToHTML(data.intro) : '',
      data.summaryText ? renderToHTML(data.summaryText) : ''
    ])

    return {
      lesson: toLesson(data, { bodyHtml, introHtml, summaryHtml }),
      topic: data.topicEntity ? toTopic(data.topicEntity) : null,
      domain: data.domainEntity ? toDomain(data.domainEntity) : null,
      previousLesson: previousLesson ? toLesson(previousLesson) : null,
      nextLesson: nextLesson ? toLesson(nextLesson) : null
    }
  }
}

export const lessonService = new LessonService()
export default lessonService
