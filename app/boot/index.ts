import {
  getContentEngine,
  createContentEngine,
  queries,
  chapterService,
  lessonService,
  courseService,
  exerciseService,
  chapterRepository,
  lessonRepository,
  courseRepository,
  exerciseRepository,
  assetRepository,
  type ContentEngineFacade,
  type Course,
  type Chapter,
  type Lesson,
  type Exercise,
  type Asset,
  type ChapterListOptions,
  type QueryOptions,
  type ChapterWithRelations
} from '@ce'
import {
  getEngine as getMarkdownEngine,
  createEngine as createMarkdownEngine,
  type MarkdownEngine,
  type VNode,
  type RenderPipelineInput,
  type RenderPipelineOptions,
  type RenderPipelineResult
} from '@me'

export interface BootEngineOptions {
  data?: Record<string, unknown>
  render?: Record<string, unknown>
}

export interface BootEngineResult {
  ok: boolean
  engine: EngineFacade
  data: Record<string, unknown>
  render: Record<string, unknown>
  contentEngine: ContentEngineFacade
  markdownEngine: MarkdownEngine
}

export interface EngineFacade {
  isInitialized(): boolean
  data: {
    source(): undefined
    query(): undefined
    getCourse(slug: string, opts?: unknown): Promise<Course | null>
    getChapter(slug: string, opts?: unknown): Promise<Chapter | null>
    getLesson(slug: string, opts?: unknown): Promise<Lesson | null>
    getExercise(slug: string, opts?: unknown): Promise<Exercise | null>
    listChapters(opts?: ChapterListOptions): Promise<Chapter[]>
    findOne(): Promise<null>
    findAll(): Promise<unknown[]>
    count(): Promise<number>
    pipe(op: string, params?: unknown, opts?: unknown): Promise<unknown>
  }
  render: {
    parser(): undefined
    renderer(): undefined
    transformers(): unknown[]
    pipe<TRendered = unknown>(
      content: RenderPipelineInput,
      opts?: RenderPipelineOptions
    ): Promise<RenderPipelineResult<TRendered>>
    toHTML(content: RenderPipelineInput, opts?: RenderPipelineOptions): Promise<string>
    toVNode(content: RenderPipelineInput, opts?: RenderPipelineOptions): Promise<VNode | null>
  }
  source(): undefined
  query(): undefined
  parser(): undefined
  renderer(): undefined
  pipe(content: unknown, opts?: unknown): Promise<unknown>
  getChapter(slug: string, opts?: unknown): Promise<Chapter | null>
  getLesson(slug: string, opts?: unknown): Promise<Lesson | null>
  listChapters(opts?: ChapterListOptions): Promise<Chapter[]>
  renderContent<TRendered = unknown>(
    content: RenderPipelineInput,
    opts?: RenderPipelineOptions
  ): Promise<RenderPipelineResult<TRendered>>
  contentEngine: ContentEngineFacade
  markdownEngine: MarkdownEngine
  queries: typeof queries
}

let __booted = false

export async function bootContentEngine(opts: BootEngineOptions = {}): Promise<BootEngineResult> {
  if (!__booted) {
    try {
      await import('../../drizzle/db')
    } catch {
    }
    __booted = true
  }
  const contentEngine = getContentEngine()
  const markdownEngine = getMarkdownEngine()

  const __noopDataPipeline = (operation: unknown, params: unknown = {}, opts: unknown = {}) => {
    const result: { operation: unknown; params: unknown; source: null; loaderMeta: Record<string, unknown>; data: unknown; errors: Error[] } = { operation, params, source: null, loaderMeta: {}, data: null, errors: [] }
    try {
      switch (operation as string) {
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
          }[operation as string]
          if (svc && typeof (svc as unknown as Record<string, unknown>)[operation as string] === 'function') {
            const fn = (svc as unknown as Record<string, (...a: unknown[]) => Promise<unknown>>)[operation as string]
            if (fn) {
              return fn(...args).then((d) => ({ ...result, data: d }))
            }
          }
          if (operation === 'listChapters') {
            return chapterService.list(args[0] as string | undefined).then((d) => ({ ...result, data: d }))
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

  const engine: EngineFacade = {
    isInitialized() { return true },

    data: {
      source() { return undefined },
      query() { return undefined },
      getCourse(slug) { return courseService.getBySlug(slug) },
      async getChapter(slug) {
        const wrapped = await chapterService.getBySlug(slug)
        return wrapped ? (wrapped.chapter as unknown as Chapter) : null
      },
      async getLesson(slug) {
        return lessonService.getBySlug(slug) as Promise<Lesson | null>
      },
      getExercise(slug) { return exerciseService.getBySlug(slug) as Promise<Exercise | null> },
      listChapters(opts) {
        const courseSlug = (opts && typeof opts === 'object' && ((opts as { courseSlug?: unknown }).courseSlug || (opts as { course?: unknown }).course)) || undefined
        return chapterService.list(typeof courseSlug === 'string' ? courseSlug : undefined) as Promise<Chapter[]>
      },
      findOne() { return Promise.resolve(null) },
      findAll() { return Promise.resolve([]) },
      count() { return Promise.resolve(0) },
      pipe(op, params, opts) { return __noopDataPipeline(op, params, opts as any) }
    },

    render: {
      parser() { return undefined },
      renderer() { return undefined },
      transformers() { return [] },
      pipe(content, opts) {
        return markdownEngine.run(content, (opts || {}) as RenderPipelineOptions) as any
      },
      toHTML(content, opts) {
        return (markdownEngine.render(content, { ...((opts || {}) as Record<string, unknown>), target: 'html' }) as Promise<string>)
      },
      async toVNode(content, opts) {
        const r = await markdownEngine.render(content, { ...((opts || {}) as Record<string, unknown>), target: 'vnode' })
        return (r as VNode | null) || null
      }
    },

    source() { return undefined },
    query() { return undefined },
    parser() { return undefined },
    renderer() { return undefined },

    pipe(content, opts) {
      const op = opts && (opts as { operation?: string }).operation
      if (op || (typeof content === 'object' && content && !('body' in content))) {
        return __noopDataPipeline(op || 'findOne', content, opts as any)
      }
      return markdownEngine.run(content as RenderPipelineInput, (opts || {}) as RenderPipelineOptions)
    },

    getChapter(slug, opts) { return this.data.getChapter(slug, opts) },
    getLesson(slug, opts) { return this.data.getLesson(slug, opts) },
    listChapters(opts) { return this.data.listChapters(opts) },
    renderContent(content, opts) { return this.render.pipe(content, opts || {}) },

    contentEngine,
    markdownEngine,
    queries
  }

  return {
    ok: true,
    engine,
    data: opts.data || {},
    render: opts.render || {},
    contentEngine,
    markdownEngine
  }
}

export async function bootEngine(opts: BootEngineOptions = {}): Promise<BootEngineResult> {
  return bootContentEngine(opts)
}

export function initContentEngine() {
  return bootContentEngine().then(r => r.engine)
}

export function getEngine() {
  let cached: EngineFacade | null = null
  return new Proxy({}, {
    get(target, prop, receiver) {
      if (!cached) throw new Error('[engine] bootEngine() not called yet.')
      return Reflect.get(cached, prop, receiver)
    }
  }) as EngineFacade
}

export {
  getContentEngine,
  createContentEngine,
  queries,
  chapterService,
  lessonService,
  courseService,
  exerciseService,
  chapterRepository,
  lessonRepository,
  courseRepository,
  exerciseRepository,
  assetRepository,
  getMarkdownEngine,
  createMarkdownEngine
}

export type {
  ContentEngineFacade,
  Course,
  Chapter,
  Lesson,
  Exercise,
  Asset,
  ChapterListOptions,
  QueryOptions,
  ChapterWithRelations,
  MarkdownEngine,
  VNode,
  RenderPipelineInput,
  RenderPipelineOptions,
  RenderPipelineResult
}

export const initEngine = initContentEngine
