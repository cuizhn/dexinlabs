import { defineEventHandler, getQuery } from 'h3'
import { getContentEngine } from '@ce'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const courseSlug = query.course && typeof query.course === 'string'
    ? query.course
    : undefined
  const engine = getContentEngine()
  return engine.listChapters({ courseSlug })
})