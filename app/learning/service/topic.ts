/**
 * 知识主题服务 - 封装主题相关的业务逻辑
 *
 * 提供主题列表、主题页面数据组装（含章节、课时、前后主题导航）等功能。
 *
 * 架构 V4（定稿）：Topic 不再有 courseId，前后主题导航基于全局主题列表。
 */
import { topicRepository } from '../repository/topic'
import type { TopicPage, ChapterWithLessons } from '~/learning/view-models'
import { normalizeSlug } from '~/utils/slug'
import { getSiblings } from '../shared'
import { toTopic, toChapter, toLesson, toExercise } from '../types'

export class TopicService {
  async list() {
    return topicRepository.list()
  }

  async getTopicPage(slug: string): Promise<TopicPage | null> {
    const clean = normalizeSlug(slug)
    if (!clean) return null

    const data = await topicRepository.getWithChaptersAndLessons(clean)
    if (!data) return null

    // 使用 getSiblings 工具函数计算前后主题导航（基于全局主题列表）
    const { previous: previousTopic, next: nextTopic } = getSiblings(data.allTopics, data.slug)

    // 组装章节及其课时（ChapterWithLessons[]）
    const chaptersWithLessons: ChapterWithLessons[] = (data.chapterList || []).map(ch => {
      const chapterLessons = (data.lessonList || []).filter(l => l.chapterId === ch.id)
      return {
        chapter: toChapter(ch as Record<string, unknown>),
        lessons: chapterLessons.map(l => toLesson(l as Record<string, unknown>))
      }
    })

    // 筛选未归入任何章节的课时（flatLessons）
    const chapterLessonIds = new Set(
      (data.chapterList || []).flatMap(ch =>
        (data.lessonList || []).filter(l => l.chapterId === ch.id).map(l => l.id)
      )
    )
    const flatLessons = (data.lessonList || [])
      .filter(l => !chapterLessonIds.has(l.id))
      .map(l => toLesson(l as Record<string, unknown>))

    return {
      topic: toTopic(data as Record<string, unknown>),
      course: null, // Course 不再通过 FK 关联，固定为 null
      chapters: chaptersWithLessons,
      lessons: flatLessons,
      exercise: data.exerciseEntity ? toExercise(data.exerciseEntity as Record<string, unknown>) : null,
      previousTopic: previousTopic ? toTopic(previousTopic as Record<string, unknown>) : null,
      nextTopic: nextTopic ? toTopic(nextTopic as Record<string, unknown>) : null
    }
  }
}

export const topicService = new TopicService()
export default topicService
