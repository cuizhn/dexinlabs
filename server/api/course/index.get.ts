import { defineEventHandler, getQuery } from 'h3'
import { getContentEngine } from '@ce'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const slug = String(query.slug || '')

  const engine = getContentEngine()

  if (slug) {
    const result = await engine.getCoursePage(slug)
    if (result) return result
  }

  return engine.getDefaultCourse()
})