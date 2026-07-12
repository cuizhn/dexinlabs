import { defineEventHandler, createError, getQuery } from 'h3'
import { exerciseService } from '@ce'

export default defineEventHandler(async event => {
  try {
    if (!process.env.DATABASE_URL) {
      throw createError({
        statusCode: 503,
        statusMessage: 'DATABASE_URL is not configured. Server cannot access the database.'
      })
    }
    const query = getQuery(event)
    const chapter = typeof query.chapter === 'string' ? query.chapter : undefined
    if (chapter) {
      const rows = await exerciseService.listByChapter(chapter)
      return { ok: true, data: rows }
    }
    const rows = await exerciseService.listAll()
    return { ok: true, data: rows }
  } catch (err) {
    if (err && (err as { statusCode?: unknown; statusMessage?: unknown }).statusCode) throw err
    const msg = err instanceof Error ? err.message : String(err)
    throw createError({ statusCode: 500, statusMessage: `Internal server error: ${msg}` })
  }
})
