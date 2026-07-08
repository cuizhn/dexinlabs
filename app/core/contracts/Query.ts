import type { Course, Chapter, Lesson, Exercise, LoaderOptions, ChapterListOptions } from '@core/contracts/Loader.js'

export interface QueryOptions extends LoaderOptions {
  useCache?: boolean
  cacheKey?: string
  ttl?: number
  forceRefresh?: boolean
  [key: string]: unknown
}

export interface QueryChapterListOptions extends ChapterListOptions {
  useCache?: boolean
  cacheKey?: string
  ttl?: number
  forceRefresh?: boolean
}

export interface QueryContractMethods {
  getCourse<TOptions extends QueryOptions = QueryOptions>(
    slug: string,
    opts?: TOptions
  ): Promise<Course | null>

  getChapter<TOptions extends QueryOptions = QueryOptions>(
    slug: string,
    opts?: TOptions
  ): Promise<Chapter | null>

  getLesson<TOptions extends QueryOptions = QueryOptions>(
    slug: string,
    opts?: TOptions
  ): Promise<Lesson | null>

  getExercise<TOptions extends QueryOptions = QueryOptions>(
    slug: string,
    opts?: TOptions
  ): Promise<Exercise | null>

  listChapters<TOptions extends QueryChapterListOptions = QueryChapterListOptions>(
    opts?: TOptions
  ): Promise<Chapter[]>
}

export interface QueryContractDefinition {
  name: string
  description: string
  methods: QueryContractMethods
}

export const QueryContract: QueryContractDefinition = {
  name: 'Query',

  description: '给业务层 / Page 调用的统一门面。负责缓存、权限、多 Loader 聚合等逻辑。不碰 Source，永远走 Engine。',

  methods: {
    async getCourse<TOptions extends QueryOptions = QueryOptions>(
      slug: string,
      opts?: TOptions
    ): Promise<Course | null> {
      throw new Error('[QueryContract.getCourse] Not implemented.')
    },
    async getChapter<TOptions extends QueryOptions = QueryOptions>(
      slug: string,
      opts?: TOptions
    ): Promise<Chapter | null> {
      throw new Error('[QueryContract.getChapter] Not implemented.')
    },
    async getLesson<TOptions extends QueryOptions = QueryOptions>(
      slug: string,
      opts?: TOptions
    ): Promise<Lesson | null> {
      throw new Error('[QueryContract.getLesson] Not implemented.')
    },
    async getExercise<TOptions extends QueryOptions = QueryOptions>(
      slug: string,
      opts?: TOptions
    ): Promise<Exercise | null> {
      throw new Error('[QueryContract.getExercise] Not implemented.')
    },
    async listChapters<TOptions extends QueryChapterListOptions = QueryChapterListOptions>(
      opts?: TOptions
    ): Promise<Chapter[]> {
      throw new Error('[QueryContract.listChapters] Not implemented.')
    }
  }
}

export type QueryContract = QueryContractMethods

export function assertContract<T>(obj: unknown): asserts obj is T {
  if (obj === null || obj === undefined) {
    throw new Error('[assertContract] Object is null or undefined')
  }
}

export function assertQueryContract(query: unknown): asserts query is QueryContractMethods {
  assertContract<QueryContractMethods>(query)
  const required = ['getCourse', 'getChapter', 'getLesson', 'getExercise', 'listChapters'] as const
  for (const method of required) {
    if (typeof (query as unknown as Record<string, unknown>)[method] !== 'function') {
      throw new Error(`[QueryContract] Missing method: ${method}`)
    }
  }
}
