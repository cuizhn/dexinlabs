import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(async () => {
  let content = null
  let markdown = null
  let services = { chapter: null, lesson: null, course: null, exercise: null }
  let queriesFallback = null
  let renderToHTMLFn = s => String(s ?? '')
  let renderToVNodeFn = null

  try {
    await import('@core/database')
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[engine.server] database unavailable:', e?.message || String(e))
    }
  }

  try {
    const ce = await import('@ce')
    if (typeof ce.getContentEngine === 'function') content = ce.getContentEngine()
    services = {
      chapter: ce.chapterService || null,
      lesson: ce.lessonService || null,
      course: ce.courseService || null,
      exercise: ce.exerciseService || null
    }
    queriesFallback = ce.queries || null
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[engine.server] content-engine unavailable:', e?.message || String(e))
    }
  }

  try {
    const me = await import('@me')
    if (typeof me.getEngine === 'function') markdown = me.getEngine()
    if (typeof me.renderToHTML === 'function') renderToHTMLFn = me.renderToHTML
    if (typeof me.renderToVNode === 'function') renderToVNodeFn = me.renderToVNode
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[engine.server] markdown-engine unavailable:', e?.message || String(e))
    }
  }

  return {
    provide: {
      content,
      markdown,
      services,
      queries: queriesFallback,
      renderToHTML: renderToHTMLFn,
      renderToVNode: renderToVNodeFn
    }
  }
})
