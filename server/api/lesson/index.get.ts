import { defineEventHandler, createError, getQuery } from 'h3'
import { getContentEngine } from '@ce'

export default defineEventHandler(async event => {
  try {
    const query = getQuery(event)
    const chapter = typeof query.chapter === 'string' ? query.chapter : undefined
    const engine = getContentEngine()
    if (chapter) {
      const rows = await engine.listLessons(chapter)
      return { ok: true, data: rows }
    }
    const courses = await engine.listCourses()
    const allLessons: Array<Record<string, unknown>> = []
    for (const course of courses) {
      for (const chapter of course.chapters || []) {
        allLessons.push(...chapter.lessons?.map(l => ({ ...l, chapter: chapter.slug }) as Record<string, unknown>) || [])
      }
    }
    return { ok: true, data: allLessons }
  } catch (err) {
    if (err && (err as { statusCode?: unknown; statusMessage?: unknown }).statusCode) throw err
    const msg = err instanceof Error ? err.message : String(err)
    throw createError({ statusCode: 500, statusMessage: `Internal server error: ${msg}` })
  }
})