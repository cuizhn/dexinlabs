/**
 * 课程服务 - 封装课程相关的业务逻辑
 *
 * 架构 V4（定稿）：courses 表精简为 id/slug/title。
 * Course 与 Topic 的业务关系由本 Service 负责组装。
 */
import { courseRepository } from '@database/repository/course'
import { topicRepository } from '@database/repository/topic'
import type { CoursePage, CatalogTopic } from '../view-models'
import { normalizeSlug } from '~/utils/slug'
import { toCourse, toTopic, toChapter, toLesson } from '@database/types'

export class CourseService {
  /**
   * 获取所有主题列表，按课程分组
   *
   * 当前实现：获取所有主题，归入单一课程（数学）。
   * 未来如有多课程，需在此处实现分组逻辑。
   */
  async listAllWithTopics(): Promise<CoursePage[]> {
    const [courseList, topicList] = await Promise.all([
      courseRepository.list(),
      topicRepository.list()
    ])

    // 取第一个课程作为默认课程（当前只有数学）
    const course = courseList.length > 0 ? toCourse(courseList[0] as Record<string, unknown>) : null
    const topics = topicList.map(t => toTopic(t as Record<string, unknown>))

    if (!course) return []

    return [{
      course,
      topics
    }]
  }

  /**
   * 获取课程目录数据（所有 Topic 及其 Chapter + Lesson）
   *
   * 用于 /courses 课程目录页，返回完整层级结构。
   */
  async getCatalog(): Promise<CatalogTopic[]> {
    const topicList = await topicRepository.list()
    const catalog: CatalogTopic[] = []

    for (const t of topicList) {
      const topic = toTopic(t as Record<string, unknown>)
      const data = await topicRepository.getWithChaptersAndLessons(topic.slug)
      if (!data) continue

      const chapters = (data.chapterList || []).map(ch => ({
        chapter: toChapter(ch as Record<string, unknown>),
        lessons: (data.lessonList || [])
          .filter(l => l.chapterId === ch.id)
          .map(l => toLesson(l as Record<string, unknown>))
      }))

      catalog.push({ topic, chapters })
    }

    return catalog
  }

  async getCoursePage(slug: string): Promise<CoursePage | null> {
    const clean = normalizeSlug(slug)
    if (!clean) return null

    const courseRow = await courseRepository.findBySlug(clean)
    if (!courseRow) return null

    const topicList = await topicRepository.list()
    return {
      course: toCourse(courseRow as Record<string, unknown>),
      topics: topicList.map(t => toTopic(t as Record<string, unknown>))
    }
  }
}

export const courseService = new CourseService()
export default courseService
