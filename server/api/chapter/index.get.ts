import { defineEventHandler, getQuery } from 'h3'
import { chapterService } from '@ce'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const courseSlug = query.course && typeof query.course === 'string'
    ? query.course
    : undefined
  return chapterService.list(courseSlug)
})
