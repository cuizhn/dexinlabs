import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { chapterService } from '@ce'

export default defineEventHandler(async event => {
  try {
    if (!process.env.DATABASE_URL) {
      throw createError({
        statusCode: 503,
        statusMessage: 'DATABASE_URL is not configured. Server cannot access the database.'
      })
    }

    const slug = getRouterParam(event, 'slug')
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug is required' })

    const body = await readBody(event)
    const { title, summary, cover, body: chapterBody, course, courseId, order } = body || {}

    const patch: Record<string, unknown> = {}
    if (title !== undefined) patch.title = String(title).trim() || null
    if (summary !== undefined) patch.summary = typeof summary === 'string' ? summary : null
    if (cover !== undefined) patch.cover = typeof cover === 'string' ? cover : null
    if (chapterBody !== undefined) patch.body = typeof chapterBody === 'string' ? chapterBody : null
    if (course !== undefined) patch.course = typeof course === 'string' ? course : null
    if (courseId !== undefined) patch.courseId = courseId === null ? null : (Number(courseId) || null)
    if (order !== undefined) patch.order = typeof order === 'number' ? order : Number(order) || 0

    const updated = await chapterService.update(slug, patch as never)

    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: `Chapter not found: ${slug}` })
    }
    return { ok: true, data: updated }
  } catch (err) {
    if (err && (err as { statusCode?: unknown; statusMessage?: unknown }).statusCode) throw err
    const msg = err instanceof Error ? err.message : String(err)
    throw createError({ statusCode: 500, statusMessage: `Internal server error: ${msg}` })
  }
})
