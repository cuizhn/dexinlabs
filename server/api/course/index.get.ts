import { defineEventHandler, getQuery } from 'h3'
import { courseService } from '@content'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const slug = String(query.slug || '')

  if (slug) {
    const result = await courseService.getCoursePage(slug)
    if (result) return result
  }

  return courseService.getDefault()
})
