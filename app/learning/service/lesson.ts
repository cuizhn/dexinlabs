/**
 * 课时服务 - 封装课时相关的业务逻辑
 *
 * 提供课时列表、课时页面数据组装（含主题、章节、前后课时导航）等功能。
 *
 * 架构 V4（定稿）：Lesson 通过 (topicId, slug) 组合键查询。
 */
import { lessonRepository } from '../repository/lesson'
import { topicRepository } from '../repository/topic'
import { chapterRepository } from '../repository/chapter'
import type { LessonPage } from '~/learning/view-models'
import { normalizeSlug } from '~/utils/slug'
import { getSiblings } from '../shared'
import { toLesson, toTopic, toChapter } from '../types'

export class LessonService {
  async list() {
    return lessonRepository.list()
  }

  /** list 的别名，保持 API 兼容 */
  async listAll() {
    return this.list()
  }

  async listByTopic(topicSlug: string) {
    return lessonRepository.listByTopic(topicSlug)
  }

  async getLessonPage(topicSlug: string, lessonSlug: string): Promise<LessonPage | null> {
    const cleanTopic = normalizeSlug(topicSlug)
    const cleanLesson = normalizeSlug(lessonSlug)
    if (!cleanTopic || !cleanLesson) return null

    const data = await lessonRepository.getWithTopicAndChapter(cleanTopic, cleanLesson)
    if (!data) return null

    const lesson = toLesson(data as Record<string, unknown>)
    const topic = data.topicEntity ? toTopic(data.topicEntity as Record<string, unknown>) : null
    const chapter = data.chapterEntity ? toChapter(data.chapterEntity as Record<string, unknown>) : null

    // 使用 getSiblings 工具函数计算前后课时导航
    const { previous, next } = getSiblings(data.siblingLessons, lesson.slug)

    return {
      lesson,
      topic,
      course: null, // Course 不再通过 FK 关联，固定为 null
      chapter,
      previousLesson: previous ? toLesson(previous as Record<string, unknown>) : null,
      nextLesson: next ? toLesson(next as Record<string, unknown>) : null
    }
  }
}

export const lessonService = new LessonService()
export default lessonService
