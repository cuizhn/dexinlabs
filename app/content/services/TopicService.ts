/**
 * 知识主题服务 - 封装主题相关的业务逻辑
 *
 * 提供主题列表、主题页面数据组装（含前后主题导航、课时列表）等功能。
 */
import { topicRepository } from '@content/repositories'
import type { TopicPage } from '../models/index'
import { normalizeSlug, toTopic, toDomain, toLesson, toExercise, getSiblings } from '../utils'

export class TopicService {
  async list(domainSlug?: string) {
    if (!domainSlug) return topicRepository.list()
    const clean = normalizeSlug(domainSlug)
    if (!clean) return []
    return topicRepository.listByDomain(clean)
  }

  async getBySlug(slug: string): Promise<TopicPage | null> {
    return this.getTopicPage(slug)
  }

  async getTopicPage(slug: string): Promise<TopicPage | null> {
    const clean = normalizeSlug(slug)
    if (!clean) return null

    const data = await topicRepository.getWithLessonsAndDomain(clean)
    if (!data) return null

    // 使用 getSiblings 工具函数计算前后主题导航
    const { previous: previousTopic, next: nextTopic } = getSiblings(data.siblingTopics, data.slug)

    // 使用 toLesson 显式选取课时字段，仅保留列表展示所需字段
    const lessons = (data.lessonList || []).map(l => toLesson(l))

    return {
      // 使用 toTopic 显式选取字段，避免仓储内部字段泄漏
      topic: toTopic(data),
      domain: data.domainEntity ? toDomain(data.domainEntity) : null,
      lessons,
      exercise: data.exerciseEntity ? toExercise(data.exerciseEntity) : null,
      previousTopic,
      nextTopic
    }
  }
}

export const topicService = new TopicService()
export default topicService
