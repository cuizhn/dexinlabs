/**
 * 课程服务 - 封装课程相关的业务逻辑
 *
 * 提供课程查询、课程页面数据组装等功能。
 * 架构 V4：Course → Topic → Chapter → Lesson
 */
import { courseRepository } from '@content/repositories'
import type { CoursePage } from '../types/index'
import { normalizeSlug, toCourse, toTopic, toLesson } from '../utils'

export class CourseService {
  /**
   * 获取所有课程及其主题列表（用于知识地图等场景）
   * 使用 toCourse/toTopic 显式选取字段，避免内部字段泄漏
   */
  async listAllWithTopics(): Promise<CoursePage[]> {
    const coursesWithTopics = await courseRepository.listAllWithTopics()
    return coursesWithTopics.map(c => ({
      course: toCourse(c),
      topics: (c.topics || []).map(t => toTopic(t))
    }))
  }

  async getCoursePage(slug: string): Promise<CoursePage | null> {
    const clean = normalizeSlug(slug)
    if (!clean) return null
    const course = await courseRepository.getWithTopicsAndLessons(clean)
    if (!course) return null
    return this.buildCoursePage(course)
  }

  /**
   * 组装课程页面数据：使用 toCourse/toTopic/toLesson 显式选取字段，
   * 避免仓储层关联查询的内部字段泄漏到 API 响应
   */
  private buildCoursePage(course: Record<string, unknown>): CoursePage {
    const rawTopics = (course.topics as Record<string, unknown>[]) || []
    const topics = rawTopics.map(t => {
      const rawLessons = (t.lessons as Record<string, unknown>[]) || []
      return {
        ...toTopic(t),
        lessons: rawLessons.map(l => toLesson(l))
      }
    })

    return {
      course: toCourse(course),
      topics
    }
  }
}

export const courseService = new CourseService()
export default courseService
