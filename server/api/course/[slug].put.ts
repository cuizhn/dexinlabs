import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
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

    const body = await readBody(event)
    const { title, summary, cover, edition, body: courseBody, order } = body || {}

    const patch: Record<string, unknown> = {}
    if (title !== undefined) patch.title = String(title).trim() || null
    if (summary !== undefined) patch.summary = typeof summary === 'string' ? summary : null
    if (cover !== undefined) patch.cover = typeof cover === 'string' ? cover : null
    if (edition !== undefined) patch.edition = typeof edition === 'string' ? edition : null
    if (courseBody !== undefined) patch.body = typeof courseBody === 'string' ? courseBody : null
    if (order !== undefined) patch.order = typeof order === 'number' ? order : Number(order) || 0

    const updated = await courseService.update(slug, patch as never)

    if (!updated) {
      throw createError({
        statusCode: 404,
        statusMessage: `Course not found: ${slug}`
      })
    }

    return { ok: true, data: updated }
  } catch (err) {
    if (err && (err as { statusCode?: unknown; statusMessage?: unknown }).statusCode) {
      throw err
    }
    const msg = err instanceof Error ? err.message : String(err)
    throw createError({ statusCode: 500, statusMessage: `Internal server error: ${msg}` })
  }
})
