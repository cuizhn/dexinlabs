import { defineEventHandler, getRouterParam, createError } from 'h3'
import { courseService } from '@ce'

export default defineEventHandler(async event => {
  try {
    if (!process.env.DATABASE_URL) {
      throw createError({
        statusCode: 503,
        statusMessage: 'DATABASE_URL is not configured. Server cannot access the database.'
      })
    }

    const slug = getRouterParam(event, 'slug')
    if (!slug) {
      throw createError({ statusCode: 400, statusMessage: 'slug is required' })
    }

    const result = await courseService.remove(slug)
    const rowCount =
      (result && typeof (result as { rowCount?: unknown }).rowCount === 'number')
        ? Number((result as { rowCount: number }).rowCount)
        : null

    if (rowCount === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `Course not found: ${slug}`
      })
    }

    return { ok: true, rowCount }
  } catch (err) {
    if (err && (err as { statusCode?: unknown; statusMessage?: unknown }).statusCode) {
      throw err
    }
    const msg = err instanceof Error ? err.message : String(err)
    throw createError({ statusCode: 500, statusMessage: `Internal server error: ${msg}` })
  }
})
