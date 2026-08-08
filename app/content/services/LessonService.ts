/**
 * 课时服务 - 封装课时相关的业务逻辑
 *
 * 架构 V4（定稿）：Lesson 唯一约束为 (topic_id, slug)。
 * getLessonPage 需要同时接收 topicSlug 和 lessonSlug。
 * Service 只负责业务数据组装，不做 Markdown 渲染。
 */
import { lessonRepository } from '@content/repositories'
import type { Lesson, LessonPage } from '../types/index'
import { normalizeSlug, toLesson, toTopic, toChapter, getSiblings } from '../utils'

export class LessonService {
  async listByTopic(topicSlug: string): Promise<Lesson[]> {
    const clean = normalizeSlug(topicSlug)
    if (!clean) return []
    return lessonRepository.listByTopic(clean)
  }

  async listAll(): Promise<Lesson[]> {
    return lessonRepository.list()
  }

  /**
   * 获取课时页面数据
   *
   * 需要同时提供 topicSlug 和 lessonSlug（组合键查询）。
   */
  async getLessonPage(topicSlug: string, lessonSlug: string): Promise<LessonPage | null> {
    const cleanTopic = normalizeSlug(topicSlug)
    const cleanLesson = normalizeSlug(lessonSlug)
    if (!cleanTopic || !cleanLesson) return null

    const data = await lessonRepository.getWithTopicAndChapter(cleanTopic, cleanLesson)
    if (!data) return null

    // 使用 getSiblings 工具函数计算前后课时导航
    const { previous: previousLesson, next: nextLesson } = getSiblings(data.siblingLessons, data.slug)

    return {
      lesson: toLesson(data as Record<string, unknown>),
      topic: data.topicEntity ? toTopic(data.topicEntity as Record<string, unknown>) : null,
      course: null, // Course 不再通过 FK 关联
      chapter: data.chapterEntity ? toChapter(data.chapterEntity as Record<string, unknown>) : null,
      previousLesson: previousLesson ? toLesson(previousLesson as Record<string, unknown>) : null,
      nextLesson: nextLesson ? toLesson(nextLesson as Record<string, unknown>) : null
    }
  }
}

export const lessonService = new LessonService()
export default lessonService
