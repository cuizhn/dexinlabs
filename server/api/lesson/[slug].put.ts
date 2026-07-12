import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { lessonService } from '@ce'

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
    const {
      title, summary, objectives, intro, body: lessonBody,
      summaryText, notes, chapter, chapterId, order
    } = body || {}

    const patch: Record<string, unknown> = {}
    if (title !== undefined) patch.title = String(title).trim() || null
    if (summary !== undefined) patch.summary = typeof summary === 'string' ? summary : null
    if (objectives !== undefined) patch.objectives = typeof objectives === 'string' ? objectives : null
    if (intro !== undefined) patch.intro = typeof intro === 'string' ? intro : null
    if (lessonBody !== undefined) patch.body = typeof lessonBody === 'string' ? lessonBody : null
    if (summaryText !== undefined) patch.summaryText = typeof summaryText === 'string' ? summaryText : null
    if (notes !== undefined) patch.notes = typeof notes === 'string' ? notes : null
    if (chapter !== undefined) patch.chapter = typeof chapter === 'string' ? chapter : null
    if (chapterId !== undefined) patch.chapterId = chapterId === null ? null : (Number(chapterId) || null)
    if (order !== undefined) patch.order = typeof order === 'number' ? order : Number(order) || 0

    const updated = await lessonService.update(slug, patch as never)

    if (!updated) throw createError({ statusCode: 404, statusMessage: `Lesson not found: ${slug}` })
    return { ok: true, data: updated }
  } catch (err) {
    if (err && (err as { statusCode?: unknown; statusMessage?: unknown }).statusCode) throw err
    const msg = err instanceof Error ? err.message : String(err)
    throw createError({ statusCode: 500, statusMessage: `Internal server error: ${msg}` })
  }
})
