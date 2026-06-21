import { courseRepository } from '~/repositories/courseRepository'

export function useCourse() {

  async function getAllCourses() {
    return await courseRepository.findAll()
  }

  async function getCourse(slug) {
    return await courseRepository.findWithMeta(slug)
  }

  return {
    getAllCourses,
    getCourse
  }
}