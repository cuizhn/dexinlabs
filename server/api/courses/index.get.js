import { courseRepository }
  from './repositories/courseRepository'

export default defineEventHandler(
  async (event) => {
    return await courseRepository.findAll(event)
  }
)