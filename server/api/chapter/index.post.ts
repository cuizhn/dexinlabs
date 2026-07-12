import { defineEventHandler, readBody, createError } from 'h3'
import { chapterService } from '@ce'

export default defineEventHandler(async event => {
  try {
    if (!process.env.DATABASE_URL) {
      throw createError({
        statusCode: 503,
        statusMessage: 'DATABASE_URL is not configured. Server cannot access the database.'
      })
    }

    const body = await readBody(event)
    const { slug, title, summary, cover, body: chapterBody, course, courseId, order } = body || {}

    if (!slug || !String(slug).trim()) {
      throw createError({ statusCode: 400, statusMessage: 'slug is required' })
    }
    if (!title || !String(title).trim()) {
      throw createError({ statusCode: 400, statusMessage: 'title is required' })
    }

    const created = await chapterService.create({
      slug: String(slug).trim(),
      title: String(title).trim(),
      summary: typeof summary === 'string' ? summary : null,
      cover: typeof cover === 'string' ? cover : null,
      body: typeof chapterBody === 'string' ? chapterBody : null,
      course: typeof course === 'string' ? course : null,
      courseId: courseId !== undefined && courseId !== null ? Number(courseId) || null : null,
      order: typeof order === 'number' ? order : (order !== undefined && order !== null ? Number(order) || 0 : 0)
    })

    if (!created) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to create chapter' })
    }
    return { ok: true, data: created }
  } catch (err) {
    if (err && (err as { statusCode?: unknown; statusMessage?: unknown }).statusCode) throw err
    const msg = err instanceof Error ? err.message : String(err)
    if (/slug.*unique|duplicate.*slug/i.test(msg)) {
      throw createError({ statusCode: 409, statusMessage: `Chapter slug already exists: ${msg}` })
    }
    throw createError({ statusCode: 500, statusMessage: `Internal server error: ${msg}` })
  }
})
