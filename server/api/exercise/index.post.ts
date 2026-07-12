import { defineEventHandler, readBody, createError } from 'h3'
import { exerciseService } from '@ce'

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
      slug, title, summary, description, body: exerciseBody,
      hint, answer, analysis, chapter, chapterId, order
    } = body || {}

    if (!slug || !String(slug).trim()) throw createError({ statusCode: 400, statusMessage: 'slug is required' })
    if (!title || !String(title).trim()) throw createError({ statusCode: 400, statusMessage: 'title is required' })

    const created = await exerciseService.create({
      slug: String(slug).trim(),
      title: String(title).trim(),
      summary: typeof summary === 'string' ? summary : null,
      description: typeof description === 'string' ? description : null,
      body: typeof exerciseBody === 'string' ? exerciseBody : null,
      hint: typeof hint === 'string' ? hint : null,
      answer: typeof answer === 'string' ? answer : null,
      analysis: typeof analysis === 'string' ? analysis : null,
      chapter: typeof chapter === 'string' ? chapter : null,
      chapterId: chapterId !== undefined && chapterId !== null ? Number(chapterId) || null : null,
      order: typeof order === 'number' ? order : (order !== undefined && order !== null ? Number(order) || 0 : 0)
    })

    if (!created) throw createError({ statusCode: 500, statusMessage: 'Failed to create exercise' })
    return { ok: true, data: created }
  } catch (err) {
    if (err && (err as { statusCode?: unknown; statusMessage?: unknown }).statusCode) throw err
    const msg = err instanceof Error ? err.message : String(err)
    if (/slug.*unique|duplicate.*slug/i.test(msg)) {
      throw createError({ statusCode: 409, statusMessage: `Exercise slug already exists: ${msg}` })
    }
    throw createError({ statusCode: 500, statusMessage: `Internal server error: ${msg}` })
  }
})
