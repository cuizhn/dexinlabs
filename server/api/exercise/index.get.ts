import { defineEventHandler, createError, getQuery } from 'h3'
import { exerciseService } from '@content'

export default defineEventHandler(async event => {
  if (!process.env.DATABASE_URL) {
    throw createError({
      statusCode: 503,
      statusMessage: 'DATABASE_URL is not configured.'
    })
  }

  const query = getQuery(event)
  const chapter = typeof query.chapter === 'string' ? query.chapter : undefined

  if (chapter) {
    return exerciseService.listByChapter(chapter)
  }

  return exerciseService.listAll()
})
