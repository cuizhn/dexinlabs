/**
 * 课时服务 - 封装课时相关的业务逻辑
 *
 * 提供课时列表、课时详情、课时页面数据组装（含前后课时导航和 Markdown 渲染）等功能。
 */
import { lessonRepository } from '@content/repositories'
import { renderToHTML } from '@markdown'
import type { Topic, Lesson, LessonPage } from '../models/index'
import { normalizeSlug, toLesson, toTopic, toDomain, getSiblings } from '../utils'

export type LessonWithTopic = Omit<Lesson, 'topic'> & {
  topic: Topic | null
}

export class LessonService {
  async listByTopic(topicSlug: string): Promise<Lesson[]> {
    const clean = normalizeSlug(topicSlug)
    if (!clean) return []
    return lessonRepository.listByTopic(clean)
  }

  async listAll(): Promise<Lesson[]> {
    return lessonRepository.list()
  }

  async getBySlug(slug: string): Promise<LessonWithTopic | null> {
    const clean = normalizeSlug(slug)
    if (!clean) return null
    const data = await lessonRepository.getWithTopicAndDomain(clean)
    if (!data) return null
    return {
      ...toLesson(data),
      topic: data.topicEntity ? toTopic(data.topicEntity) : null
    } as LessonWithTopic
  }

  async getLessonPage(slug: string): Promise<LessonPage | null> {
    const clean = normalizeSlug(slug)
    if (!clean) return null

    const data = await lessonRepository.getWithTopicAndDomain(clean)
    if (!data) return null

    // 使用 getSiblings 工具函数计算前后课时导航
    const { previous: previousLesson, next: nextLesson } = getSiblings(data.siblingLessons, data.slug)

    // 将 Markdown 字段渲染为 HTML，供前端直接展示
    const [bodyHtml, introHtml, summaryHtml] = await Promise.all([
      data.body ? renderToHTML(data.body) : '',
      data.intro ? renderToHTML(data.intro) : '',
      data.summaryText ? renderToHTML(data.summaryText) : ''
    ])

    return {
      // 使用 toLesson 显式选取字段，避免仓储内部字段泄漏到 API 响应
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
