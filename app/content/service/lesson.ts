/**
 * 课时服务 - 封装课时相关的业务逻辑
 *
 * 提供课时列表、课时页面数据组装（含主题、章节、前后课时导航）等功能。
 *
 * 架构 V5（三层 identity）：Lesson 通过 (topic_slug, chapter_slug, lesson_slug) 三元组查询。
 */
import { lessonRepository } from '@database/repository/lesson'
import type { LessonPage } from '../view-models'
import { normalizeSlug } from '~/utils/slug'
import { getSiblings } from '../navigation'
import { toLesson, toTopic, toChapter } from '@database/types'

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

  async getLessonPage(
    topicSlug: string,
    chapterSlug: string,
    lessonSlug: string
  ): Promise<LessonPage | null> {
    const cleanTopic = normalizeSlug(topicSlug)
    const cleanChapter = normalizeSlug(chapterSlug)
    const cleanLesson = normalizeSlug(lessonSlug)
    if (!cleanTopic || !cleanChapter || !cleanLesson) return null

    const data = await lessonRepository.getWithTopicAndChapter(cleanTopic, cleanChapter, cleanLesson)
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
