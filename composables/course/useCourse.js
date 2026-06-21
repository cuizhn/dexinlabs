// composables/useCourse.js

import { courseRepository } from '~/repositories/courseRepository'

export function useCourse() {

  /**
   * 获取课程详情（_course.yml）
   */
  async function getCourse(courseSlug) {
    const course =
      await courseRepository.findBySlug(courseSlug)

    return course
  }

  /**
   * 获取课程章节列表
   */
  async function getChapters(courseSlug) {
    const chapters =
      await courseRepository.getChapters(courseSlug)

    return chapters
  }

  return {
    getCourse,
    getChapters,
  }
}