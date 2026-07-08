import { defineEventHandler, getQuery } from 'h3'
import { chapterService } from '@data/services/index'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const courseSlug = query.course && typeof query.course === 'string'
    ? query.course
    : null
  return chapterService.list(courseSlug)
})
