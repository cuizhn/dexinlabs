/**
 * GET /api/chapter - 获取章节列表，可选按课程 slug 过滤
 */
import { defineEventHandler, getQuery } from 'h3'
import { chapterService } from '@content'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const courseSlug = typeof query.course === 'string' ? query.course : undefined

  return chapterService.list(courseSlug)
})
