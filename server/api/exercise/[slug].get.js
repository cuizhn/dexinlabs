import { defineEventHandler, getRouterParam, createError } from 'h3'
import { exerciseService } from '@ce'

export default defineEventHandler(async event => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  try {
    const exercise = await exerciseService.getBySlug(slug)

    if (!exercise) {
      throw createError({
        statusCode: 404,
        statusMessage: `Exercise not found: ${slug}`
      })
    }

    return exercise
  } catch (e) {
    if (e && e.statusCode) throw e
    if (e && e.code === 'DATABASE_URL_MISSING') {
      throw createError({
        statusCode: 503,
        statusMessage: 'DATABASE_URL is not configured',
        data: { message: e.message, code: e.code, hint: 'Vercel: Project → Settings → Environment Variables → Add DATABASE_URL' }
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load exercise',
      data: { message: e?.message || String(e) }
    })
  }
})
