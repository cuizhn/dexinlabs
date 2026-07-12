import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { exerciseService } from '@ce'

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
      title, summary, description, body: exerciseBody,
      hint, answer, analysis, chapter, chapterId, order
    } = body || {}

    const patch: Record<string, unknown> = {}
    if (title !== undefined) patch.title = String(title).trim() || null
    if (summary !== undefined) patch.summary = typeof summary === 'string' ? summary : null
    if (description !== undefined) patch.description = typeof description === 'string' ? description : null
    if (exerciseBody !== undefined) patch.body = typeof exerciseBody === 'string' ? exerciseBody : null
    if (hint !== undefined) patch.hint = typeof hint === 'string' ? hint : null
    if (answer !== undefined) patch.answer = typeof answer === 'string' ? answer : null
    if (analysis !== undefined) patch.analysis = typeof analysis === 'string' ? analysis : null
    if (chapter !== undefined) patch.chapter = typeof chapter === 'string' ? chapter : null
    if (chapterId !== undefined) patch.chapterId = chapterId === null ? null : (Number(chapterId) || null)
    if (order !== undefined) patch.order = typeof order === 'number' ? order : Number(order) || 0

    const updated = await exerciseService.update(slug, patch as never)

    if (!updated) throw createError({ statusCode: 404, statusMessage: `Exercise not found: ${slug}` })
    return { ok: true, data: updated }
  } catch (err) {
    if (err && (err as { statusCode?: unknown; statusMessage?: unknown }).statusCode) throw err
    const msg = err instanceof Error ? err.message : String(err)
    throw createError({ statusCode: 500, statusMessage: `Internal server error: ${msg}` })
  }
})
