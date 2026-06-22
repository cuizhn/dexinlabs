/**
 * 课程 Composable
 * 职责：业务逻辑层，调用 Repository
 */
import { courseRepository } from '~/repositories/courseRepository'
import { chapterRepository } from '~/repositories/chapterRepository'

/**
 * 获取所有课程
 * 课程列表页使用
 */
export async function useCourses() {
  return await courseRepository.findAll()
}

/**
 * 获取单个课程（含章节列表）
 * 课程详情页使用
 */
export async function useCourseDetail(slug) {
  const course = await courseRepository.findBySlug(slug)
  if (!course) return null

  const chapters = await chapterRepository.findByCourse(slug)
  return { ...course, chapters }
}
