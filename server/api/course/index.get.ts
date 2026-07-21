/**
 * GET /api/course - 获取课程信息
 *
 * 支持 ?slug=xxx 查询指定课程，无参数时返回默认课程。
 */
import { defineEventHandler, getQuery, createError } from 'h3'
import { courseService } from '@content'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const slug = typeof query.slug === 'string' ? query.slug : ''

  if (slug) {
    const result = await courseService.getCoursePage(slug)
    if (result) return result
  }

  const result = await courseService.getDefault()
  if (!result) {
    throw createError({ statusCode: 404, statusMessage: '未找到默认课程' })
  }
  return result
})
