import { defineEventHandler, readBody, createError } from 'h3'
import { lessonService } from '@ce'

export default defineEventHandler(async event => {
  try {
    if (!process.env.DATABASE_URL) {
      throw createError({
        statusCode: 503,
        statusMessage: 'DATABASE_URL is not configured. Server cannot access the database.'
      })
    }

    const body = await readBody(event)
    const {
      slug, title, summary, objectives, intro, body: lessonBody,
      summaryText, notes, chapter, chapterId, order
    } = body || {}

    if (!slug || !String(slug).trim()) throw createError({ statusCode: 400, statusMessage: 'slug is required' })
    if (!title || !String(title).trim()) throw createError({ statusCode: 400, statusMessage: 'title is required' })

    const created = await lessonService.create({
      slug: String(slug).trim(),
      title: String(title).trim(),
      summary: typeof summary === 'string' ? summary : null,
      objectives: typeof objectives === 'string' ? objectives : null,
      intro: typeof intro === 'string' ? intro : null,
      body: typeof lessonBody === 'string' ? lessonBody : null,
      summaryText: typeof summaryText === 'string' ? summaryText : null,
      notes: typeof notes === 'string' ? notes : null,
      chapter: typeof chapter === 'string' ? chapter : null,
      chapterId: chapterId !== undefined && chapterId !== null ? Number(chapterId) || null : null,
      order: typeof order === 'number' ? order : (order !== undefined && order !== null ? Number(order) || 0 : 0)
    })

    if (!created) throw createError({ statusCode: 500, statusMessage: 'Failed to create lesson' })
    return { ok: true, data: created }
  } catch (err) {
    if (err && (err as { statusCode?: unknown; statusMessage?: unknown }).statusCode) throw err
    const msg = err instanceof Error ? err.message : String(err)
    if (/slug.*unique|duplicate.*slug/i.test(msg)) {
      throw createError({ statusCode: 409, statusMessage: `Lesson slug already exists: ${msg}` })
    }
    throw createError({ statusCode: 500, statusMessage: `Internal server error: ${msg}` })
  }
})
