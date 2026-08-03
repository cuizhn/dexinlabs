/**
 * 课时服务 - 封装课时相关的业务逻辑
 *
 * 提供课时列表、课时详情、课时页面数据组装（含前后课时导航）等功能。
 * Markdown 渲染由 Composable/Page 层调用 @markdown 完成，Service 只负责内容获取与组合。
 */
import { lessonRepository } from '@content/repositories'
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

    return {
      // 使用 toLesson 显式选取字段，避免仓储内部字段泄漏到 API 响应
      lesson: toLesson(data),
      topic: data.topicEntity ? toTopic(data.topicEntity) : null,
      domain: data.domainEntity ? toDomain(data.domainEntity) : null,
      previousLesson: previousLesson ? toLesson(previousLesson) : null,
      nextLesson: nextLesson ? toLesson(nextLesson) : null
    }
  }
}

export const lessonService = new LessonService()
export default lessonService
