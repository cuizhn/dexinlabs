/**
 * 知识主题服务 - 封装主题相关的业务逻辑
 *
 * 提供主题列表、主题页面数据组装（含章节、课时、前后主题导航）等功能。
 *
 * 架构 V4：Topic → Chapter → Lesson
 * TopicPage 包含 chapters（章节及其课时）和 lessons（未归入章节的课时）。
 */
import { topicRepository } from '@content/repositories'
import type { TopicPage, ChapterWithLessons } from '../types/index'
import { normalizeSlug, toTopic, toCourse, toChapter, toLesson, toExercise, getSiblings } from '../utils'

export class TopicService {
  async list(courseId?: number) {
    if (courseId) return topicRepository.listByCourse(courseId)
    return topicRepository.list()
  }

  async getTopicPage(slug: string): Promise<TopicPage | null> {
    const clean = normalizeSlug(slug)
    if (!clean) return null

    const data = await topicRepository.getWithChaptersAndLessons(clean)
    if (!data) return null

    // 使用 getSiblings 工具函数计算前后主题导航
    const { previous: previousTopic, next: nextTopic } = getSiblings(data.siblingTopics, data.slug)

    // 组装章节及其课时（ChapterWithLessons[]）
    const chaptersWithLessons: ChapterWithLessons[] = (data.chapterList || []).map(ch => {
      // 从 topic 的 lessonList 中筛选属于该章节的课时
      const chapterLessons = (data.lessonList || []).filter(l => l.chapterId === ch.id)
      return {
        chapter: toChapter(ch),
        lessons: chapterLessons.map(l => toLesson(l))
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
      .map(l => toLesson(l))

    return {
      topic: toTopic(data),
      course: data.courseEntity ? toCourse(data.courseEntity) : null,
      chapters: chaptersWithLessons,
      lessons: flatLessons,
      exercise: data.exerciseEntity ? toExercise(data.exerciseEntity) : null,
      previousTopic,
      nextTopic
    }
  }
}

export const topicService = new TopicService()
export default topicService
