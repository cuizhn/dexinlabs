import { getQuery, getSource, getParser, getRenderer, getTransformers } from '@core/registry'
import {
  runRenderPipeline,
  renderToHTML,
  renderToVNode,
  type RenderPipelineOptions,
  type RenderPipelineInput,
  type RenderPipelineResult
} from '@render/pipeline'
import type {
  SourceContract,
  LoaderContract,
  QueryContract,
  SupportedCollection,
  SourceWhereClause,
  Course,
  Chapter,
  Lesson,
  Exercise,
  QueryOptions,
  QueryChapterListOptions,
  SourceFindAllOptions
} from '@core/contracts/data.js'
import type {
  ParserContract,
  RendererContract,
  TransformerContract,
  VNode
} from '@core/contracts/render.js'

interface EngineState {
  initialized: boolean
}

const __engine_state: EngineState = {
  initialized: false
}

export type DataPipelineOperation =
  | 'getCourse'
  | 'getChapter'
  | 'getLesson'
  | 'getExercise'
  | 'listChapters'
  | 'findOne'
  | 'findAll'
  | 'count'
  | string

export interface DataPipelineResult<TData = unknown> {
  operation: DataPipelineOperation
  params: unknown
  source: string | null
  loaderMeta: Record<string, unknown>
  data: TData | null
  errors: Error[]
}

export interface DataPipeOptions {
  source?: SourceContract
  loader?: LoaderContract
  query?: QueryContract
  [key: string]: unknown
}

export interface EngineDataFacade {
  source(name?: string | null): SourceContract | null | undefined
  query(name?: string | null): QueryContract | null | undefined

  getCourse(slug: string, opts?: QueryOptions): Promise<Course | null>
  getChapter(slug: string, opts?: QueryOptions): Promise<Chapter | null>
  getLesson(slug: string, opts?: QueryOptions): Promise<Lesson | null>
  getExercise(slug: string, opts?: QueryOptions): Promise<Exercise | null>
  listChapters(opts?: QueryChapterListOptions): Promise<Chapter[]>

  findOne<T = unknown>(
    collection: SupportedCollection,
    where?: SourceWhereClause
  ): Promise<T | null>
  findAll<T = unknown>(
    collection: SupportedCollection,
    opts?: SourceFindAllOptions
  ): Promise<T[]>
  count(collection: SupportedCollection, where?: SourceWhereClause): Promise<number>

  pipe<TData = unknown>(
    operation: string,
    params?: unknown,
    opts?: DataPipeOptions
  ): Promise<DataPipelineResult<TData>>
}

export interface EngineRenderFacade {
  parser(name?: string | null): ParserContract | null | undefined
  renderer(name?: string | null): RendererContract | null | undefined
  transformers(): TransformerContract[]

  pipe<TRendered = VNode | string | null>(
    content: RenderPipelineInput,
    opts?: RenderPipelineOptions
  ): Promise<RenderPipelineResult<TRendered>>
  toHTML(content: RenderPipelineInput, opts?: RenderPipelineOptions): Promise<string>
  toVNode(
    content: RenderPipelineInput,
    opts?: RenderPipelineOptions
  ): Promise<VNode | null>
}

export interface EngineFacade {
  isInitialized(): boolean

  data: EngineDataFacade
  render: EngineRenderFacade

  source(name?: string | null): SourceContract | null | undefined
  query(name?: string | null): QueryContract | null | undefined
  parser(name?: string | null): ParserContract | null | undefined
  renderer(name?: string | null): RendererContract | null | undefined

  pipe<TResult = unknown>(
    content: RenderPipelineInput | unknown,
    opts?: RenderPipelineOptions & DataPipeOptions & { operation?: string }
  ): Promise<RenderPipelineResult<TResult> | DataPipelineResult<TResult>>

  getChapter(slug: string, opts?: QueryOptions): Promise<Chapter | null>
  getLesson(slug: string, opts?: QueryOptions): Promise<Lesson | null>
  listChapters(opts?: QueryChapterListOptions): Promise<Chapter[]>

  renderContent<TRendered = VNode | string | null>(
    content: RenderPipelineInput,
    opts?: RenderPipelineOptions
  ): Promise<RenderPipelineResult<TRendered>>
}

export type ContentEngineFacade = EngineFacade

export type BootFunction = () => void | Promise<void>

export async function initContentEngine(bootFn: BootFunction | null = null): Promise<EngineFacade> {
  if (__engine_state.initialized) return getEngine()
  if (typeof bootFn === 'function') {
    await bootFn()
  }
  __engine_state.initialized = true
  return getEngine()
}

export async function initEngine(bootFn: BootFunction | null = null): Promise<EngineFacade> {
  return initContentEngine(bootFn)
}

function _runDataPipe<TData = unknown>(
  operation: DataPipelineOperation,
  params: unknown = {},
  opts: DataPipeOptions = {}
): Promise<DataPipelineResult<TData>> {
  return new Promise((resolve) => {
    const result: DataPipelineResult<TData> = {
      operation,
      params,
      source: null,
      loaderMeta: {},
      data: null,
      errors: []
    }
    const source: SourceContract | undefined = opts.source || getSource() || undefined
    const loader: LoaderContract | undefined = opts.loader || undefined
    const query: QueryContract | undefined = opts.query || getQuery() || undefined
    try {
      result.source = source ? (source.constructor as { name?: string })?.name || 'anonymous' : null

      switch (operation) {
        case 'getCourse':
        case 'getChapter':
        case 'getLesson':
        case 'getExercise':
        case 'listChapters': {
          const op = operation as 'getCourse' | 'getChapter' | 'getLesson' | 'getExercise' | 'listChapters'
          const args: unknown[] = Array.isArray(params) ? params : [params]
          if (query && typeof (query as unknown as Record<string, unknown>)[op] === 'function') {
            const qFn = (query as unknown as Record<string, (...a: unknown[]) => Promise<unknown>>)[op]
            if (qFn) {
              qFn(...args)
                .then((d) => { result.data = d as TData; resolve(result) })
                .catch((e) => { result.errors.push(e instanceof Error ? e : new Error(String(e))); resolve(result) })
              return
            }
          } else if (loader && typeof (loader as unknown as Record<string, unknown>)[op] === 'function') {
            const loaderFn = (loader as unknown as Record<string, (...a: unknown[]) => Promise<unknown>>)[op]
            if (loaderFn) {
              loaderFn(...args)
                .then((d) => { result.data = d as TData; resolve(result) })
                .catch((e) => { result.errors.push(e instanceof Error ? e : new Error(String(e))); resolve(result) })
              return
            }
          }
          resolve(result)
          break
        }
        case 'findOne': {
          if (source) {
            const [collection, where] = params as [SupportedCollection, SourceWhereClause]
            source.findOne<TData>(collection, where)
              .then((d) => { result.data = d; resolve(result) })
              .catch((e) => { result.errors.push(e instanceof Error ? e : new Error(String(e))); resolve(result) })
            return
          }
          resolve(result)
          break
        }
        case 'findAll': {
          if (source) {
            const [collection, findOpts] = params as [SupportedCollection, SourceFindAllOptions]
            source.findAll<TData>(collection, findOpts || {})
              .then((d) => { result.data = d as unknown as TData; resolve(result) })
              .catch((e) => { result.errors.push(e instanceof Error ? e : new Error(String(e))); resolve(result) })
            return
          }
          resolve(result)
          break
        }
        case 'count': {
          if (source) {
            const [collection, where] = params as [SupportedCollection, SourceWhereClause]
            source.count(collection, where || {})
              .then((d) => { result.data = d as unknown as TData; resolve(result) })
              .catch((e) => { result.errors.push(e instanceof Error ? e : new Error(String(e))); resolve(result) })
            return
          }
          resolve(result)
          break
        }
        default:
          result.errors.push(new Error(`[Engine.data.pipe] Unknown operation: ${operation}`))
          resolve(result)
      }
    } catch (e) {
      result.errors.push(e instanceof Error ? e : new Error(String(e)))
      resolve(result)
    }
  })
}

export function getEngine(): EngineFacade {
  const facade: EngineFacade = {
    isInitialized(): boolean {
      return __engine_state.initialized
    },

    data: {
      source(name: string | null = null): SourceContract | null | undefined {
        return getSource(name || undefined)
      },
      query(name: string | null = null): QueryContract | null | undefined {
        return getQuery(name || undefined)
      },

      async getCourse(slug: string, opts: QueryOptions = {}): Promise<Course | null> {
        const q = getQuery()
        if (!q) throw new Error('[Engine.data] No Query registered. Run registerData() first.')
        return q.getCourse(slug, opts)
      },
      async getChapter(slug: string, opts: QueryOptions = {}): Promise<Chapter | null> {
        const q = getQuery()
        if (!q) throw new Error('[Engine.data] No Query registered. Run registerData() first.')
        return q.getChapter(slug, opts)
      },
      async getLesson(slug: string, opts: QueryOptions = {}): Promise<Lesson | null> {
        const q = getQuery()
        if (!q) throw new Error('[Engine.data] No Query registered. Run registerData() first.')
        return q.getLesson(slug, opts)
      },
      async getExercise(slug: string, opts: QueryOptions = {}): Promise<Exercise | null> {
        const q = getQuery()
        if (!q) throw new Error('[Engine.data] No Query registered. Run registerData() first.')
        return q.getExercise(slug, opts)
      },
      async listChapters(opts: QueryChapterListOptions = {}): Promise<Chapter[]> {
        const q = getQuery()
        if (!q) throw new Error('[Engine.data] No Query registered. Run registerData() first.')
        return q.listChapters(opts)
      },

      async findOne<T = unknown>(
        collection: SupportedCollection,
        where: SourceWhereClause = {}
      ): Promise<T | null> {
        const s = getSource()
        if (!s) throw new Error('[Engine.data] No Source registered. Run registerData() first.')
        return s.findOne<T>(collection, where)
      },
      async findAll<T = unknown>(
        collection: SupportedCollection,
        opts: SourceFindAllOptions = {}
      ): Promise<T[]> {
        const s = getSource()
        if (!s) throw new Error('[Engine.data] No Source registered. Run registerData() first.')
        return s.findAll<T>(collection, opts)
      },
      async count(collection: SupportedCollection, where: SourceWhereClause = {}): Promise<number> {
        const s = getSource()
        if (!s) throw new Error('[Engine.data] No Source registered. Run registerData() first.')
        return s.count(collection, where)
      },

      async pipe<TData = unknown>(
        operation: string,
        params: unknown = {},
        opts: DataPipeOptions = {}
      ): Promise<DataPipelineResult<TData>> {
        return _runDataPipe<TData>(operation, params, opts)
      }
    },

    render: {
      parser(name: string | null = null): ParserContract | null | undefined {
        return getParser(name || undefined)
      },
      renderer(name: string | null = null): RendererContract | null | undefined {
        return getRenderer(name || undefined)
      },
      transformers(): TransformerContract[] {
        return getTransformers()
      },

      async pipe<TRendered = VNode | string | null>(
        content: RenderPipelineInput,
        opts: RenderPipelineOptions = {}
      ): Promise<RenderPipelineResult<TRendered>> {
        return runRenderPipeline<TRendered>(content, opts)
      },
      async toHTML(
        content: RenderPipelineInput,
        opts: RenderPipelineOptions = {}
      ): Promise<string> {
        return renderToHTML(content, opts)
      },
      async toVNode(
        content: RenderPipelineInput,
        opts: RenderPipelineOptions = {}
      ): Promise<VNode | null> {
        return renderToVNode(content, opts)
      }
    },

    source(name: string | null = null): SourceContract | null | undefined {
      return getSource(name || undefined)
    },
    query(name: string | null = null): QueryContract | null | undefined {
      return getQuery(name || undefined)
    },
    parser(name: string | null = null): ParserContract | null | undefined {
      return getParser(name || undefined)
    },
    renderer(name: string | null = null): RendererContract | null | undefined {
      return getRenderer(name || undefined)
    },

    async pipe<TResult = unknown>(
      content: RenderPipelineInput | unknown,
      opts: RenderPipelineOptions & DataPipeOptions & { operation?: string } = {}
    ): Promise<RenderPipelineResult<TResult> | DataPipelineResult<TResult>> {
      const isDataOperation = Boolean(
        opts &&
          (opts.operation ||
            (typeof content === 'object' &&
              content !== null &&
              typeof (content as { slug?: unknown }).slug === 'string' &&
              !('body' in (content as object))))
      )
      if (isDataOperation) {
        return _runDataPipe<TResult>(opts.operation || 'findOne', content, opts)
      }
      return runRenderPipeline<TResult>(content as RenderPipelineInput, opts)
    },

    async getChapter(slug: string, opts: QueryOptions = {}): Promise<Chapter | null> {
      return this.data.getChapter(slug, opts)
    },
    async getLesson(slug: string, opts: QueryOptions = {}): Promise<Lesson | null> {
      return this.data.getLesson(slug, opts)
    },
    async listChapters(opts: QueryChapterListOptions = {}): Promise<Chapter[]> {
      return this.data.listChapters(opts)
    },

    async renderContent<TRendered = VNode | string | null>(
      content: RenderPipelineInput,
      opts: RenderPipelineOptions = {}
    ): Promise<RenderPipelineResult<TRendered>> {
      return this.render.pipe<TRendered>(content, opts)
    }
  }

  return facade
}

export const ContentEngine: EngineFacade = getEngine()
export const Engine: EngineFacade = ContentEngine
export default Engine
