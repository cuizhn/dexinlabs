import { defineEventHandler, getQuery, createError } from 'h3'
import { chapterService } from '@ce'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const courseSlug = query.course && typeof query.course === 'string'
    ? query.course
    : null
  try {
    return await chapterService.list(courseSlug)
  } catch (e) {
    if (e && e.code === 'DATABASE_URL_MISSING') {
      throw createError({
        statusCode: 503,
        statusMessage: 'DATABASE_URL is not configured',
        data: { message: e.message, code: e.code, hint: 'Vercel: Project → Settings → Environment Variables → Add DATABASE_URL' }
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to list chapters',
      data: { message: e?.message || String(e) }
    })
  }
})
