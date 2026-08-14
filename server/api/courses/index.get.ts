import { defineEventHandler, getQuery, createError } from 'h3'
import { courseService } from '~/content/service/course'
import { assertDatabaseReady } from '@server/utils/error'

export default defineEventHandler(async event => {
  assertDatabaseReady()

  const query = getQuery(event)

  // ?catalog=true → 课程目录（所有 Topic + Chapter + Lesson）
  if (query.catalog === 'true') {
    return courseService.getCatalog()
  }

  const slug = typeof query.slug === 'string' ? query.slug : ''

  if (slug) {
    const result = await courseService.getCoursePage(slug)
    if (!result) {
      throw createError({ statusCode: 404, message: `未找到课程：${slug}` })
    }
    return result
  }

  return courseService.listAllWithTopics()
})
