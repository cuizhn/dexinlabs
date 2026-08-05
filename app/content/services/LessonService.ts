/**
 * 课时服务 - 封装课时相关的业务逻辑
 *
 * 提供课时列表、课时详情、课时页面数据组装（含前后课时导航）等功能。
 * Service 只负责业务数据组装，不做 Markdown 渲染。
 * 内容渲染由 Renderer 基于 Lesson AST 驱动（Block → Vue Component）。
 *
 * @see standards/decisions/ADR-0010-lesson-ast-storage.md
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
