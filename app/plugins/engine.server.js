import { defineNuxtPlugin } from '#imports'
import {
  getContentEngine,
  chapterService,
  lessonService,
  courseService,
  exerciseService,
  bootContentEngine,
  queries
} from '@ce'
import {
  getEngine as getMarkdownEngine,
  renderToHTML,
  renderToVNode
} from '@me'

export default defineNuxtPlugin(async (nuxtApp) => {
  await bootContentEngine()
  const ce = getContentEngine()
  const md = getMarkdownEngine()

  const __noopDataPipeline = (operation, params = {}, opts = {}) => {
    const result = { operation, params, source: null, loaderMeta: {}, data: null, errors: [] }
    try {
      switch (operation) {
        case 'getCourse':
        case 'getChapter':
        case 'getLesson':
        case 'getExercise':
        case 'listChapters': {
          const args = Array.isArray(params) ? params : [params]
          const svc = {
            getCourse: courseService,
            getChapter: chapterService,
            getLesson: lessonService,
            getExercise: exerciseService
          }[operation]
          if (svc && typeof svc[operation] === 'function') {
            return svc[operation](...args).then((d) => ({ ...result, data: d }))
          }
          if (operation === 'listChapters') {
            return chapterService.list(args[0]).then((d) => ({ ...result, data: d }))
          }
          return Promise.resolve(result)
        }
        default:
          return Promise.resolve(result)
      }
    } catch (e) {
      result.errors.push(e instanceof Error ? e : new Error(String(e)))
      return Promise.resolve(result)
    }
  }

  const engine = {
    isInitialized() { return true },

    data: {
      source() { return undefined },
      query() { return undefined },
      getCourse(slug, opts) { return courseService.getBySlug(slug) },
      async getChapter(slug, opts) {
        const wrapped = await chapterService.getBySlug(slug)
        return wrapped ? wrapped.chapter : null
      },
      async getLesson(slug, opts) {
        return lessonService.getBySlug(slug)
      },
      getExercise(slug, opts) { return exerciseService.getBySlug(slug) },
      listChapters(opts) {
        const courseSlug = (opts && typeof opts === 'object' && (opts.courseSlug || opts.course)) || undefined
        return chapterService.list(typeof courseSlug === 'string' ? courseSlug : undefined)
      },
      findOne() { return Promise.resolve(null) },
      findAll() { return Promise.resolve([]) },
      count() { return Promise.resolve(0) },
      pipe(op, params, opts) { return __noopDataPipeline(op, params, opts) }
    },

    render: {
      parser() { return undefined },
      renderer() { return undefined },
      transformers() { return [] },
      pipe(content, opts) { return md.run(content, opts || {}) },
      toHTML(content, opts) { return renderToHTML(content, opts || {}) },
      async toVNode(content, opts) {
        const r = await renderToVNode(content, opts || {})
        return r || null
      }
    },

    source() { return undefined },
    query() { return undefined },
    parser() { return undefined },
    renderer() { return undefined },

    pipe(content, opts) {
      const op = opts && opts.operation
      if (op || (typeof content === 'object' && content && !('body' in content))) {
        return __noopDataPipeline(op || 'findOne', content, opts || {})
      }
      return md.run(content, opts || {})
    },

    getChapter(slug, opts) { return this.data.getChapter(slug, opts) },
    getLesson(slug, opts) { return this.data.getLesson(slug, opts) },
    listChapters(opts) { return this.data.listChapters(opts) },
    renderContent(content, opts) { return this.render.pipe(content, opts || {}) },

    contentEngine: ce,
    queries
  }

  return {
    provide: {
      engine,
      contentEngine: ce,
      contentQuery: {
        getChapter: (slug, opts) => engine.getChapter(slug, opts),
        getLesson: (slug, opts) => engine.getLesson(slug, opts),
        listChapters: (opts) => engine.listChapters(opts),
        renderContent: (raw, opts) => engine.renderContent(raw, opts)
      }
    }
  }
})
