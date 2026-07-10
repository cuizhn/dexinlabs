import { defineEventHandler, createError } from 'h3'
import { courseService } from '@ce'

export default defineEventHandler(async () => {
  try {
    return await courseService.getDefault()
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
      statusMessage: 'Failed to load course',
      data: { message: e?.message || String(e) }
    })
  }
})
