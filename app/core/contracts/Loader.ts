import type { TransformedRootAstNode } from '@core/contracts/Transformer.js'
import type { RootAstNode } from '@core/contracts/Parser.js'

export interface LoaderOptions {
  withRelations?: boolean
  withContent?: boolean
  parseContent?: boolean
  transformContent?: boolean
  [key: string]: unknown
}

export interface BaseContentEntity {
  id: number | null
  slug: string
  title: string
  summary?: string | null
  order: number
  createdAt?: Date
  updatedAt?: Date
  [key: string]: unknown
}

export interface Lesson extends BaseContentEntity {
  chapter?: string | null
  chapterId?: number | null
  objectives?: string | null
  intro?: string | null
  body?: string | null
  summaryText?: string | null
  notes?: string | null
  rawAst?: RootAstNode
  ast?: TransformedRootAstNode
}

export interface Chapter extends BaseContentEntity {
  course?: string | null
  courseId?: number | null
  cover?: string | null
  body?: string | null
  lessons?: Lesson[]
  exercises?: Exercise[]
  rawAst?: RootAstNode
  ast?: TransformedRootAstNode
}

export interface Course extends BaseContentEntity {
  cover?: string | null
  edition?: string | null
  body?: string | null
  chapters?: Chapter[]
  rawAst?: RootAstNode
  ast?: TransformedRootAstNode
}

export interface Exercise extends BaseContentEntity {
  description?: string | null
  body?: string | null
  chapter?: string | null
  chapterId?: number | null
  hint?: string | null
  answer?: string | null
  analysis?: string | null
}

export interface Asset extends BaseContentEntity {
  type: string
  url: string
  mime?: string | null
  size?: number | null
  meta?: string | null
}

export interface ChapterListOptions extends LoaderOptions {
  courseSlug?: string
  limit?: number
  offset?: number
  orderBy?: string
}

export interface LoaderContractMethods {
  loadCourse<TOptions extends LoaderOptions = LoaderOptions>(
    slug: string,
    opts?: TOptions
  ): Promise<Course | null>

  loadChapter<TOptions extends LoaderOptions = LoaderOptions>(
    slug: string,
    opts?: TOptions
  ): Promise<Chapter | null>

  loadLesson<TOptions extends LoaderOptions = LoaderOptions>(
    slug: string,
    opts?: TOptions
  ): Promise<Lesson | null>

  loadAsset<TOptions extends LoaderOptions = LoaderOptions>(
    slug: string,
    opts?: TOptions
  ): Promise<Asset | null>

  listChapters<TOptions extends ChapterListOptions = ChapterListOptions>(
    opts?: TOptions
  ): Promise<Chapter[]>
}

export interface LoaderContractDefinition {
  name: string
  description: string
  methods: LoaderContractMethods
}

export const LoaderContract: LoaderContractDefinition = {
  name: 'Loader',

  description: '从 Source 拉取数据后，负责组装业务对象（Course → Chapter → Lesson 树形结构、关联对象等）。Source 不做聚合，Loader 做。',

  methods: {
    async loadCourse<TOptions extends LoaderOptions = LoaderOptions>(
      slug: string,
      opts?: TOptions
    ): Promise<Course | null> {
      throw new Error('[LoaderContract.loadCourse] Not implemented.')
    },
    async loadChapter<TOptions extends LoaderOptions = LoaderOptions>(
      slug: string,
      opts?: TOptions
    ): Promise<Chapter | null> {
      throw new Error('[LoaderContract.loadChapter] Not implemented.')
    },
    async loadLesson<TOptions extends LoaderOptions = LoaderOptions>(
      slug: string,
      opts?: TOptions
    ): Promise<Lesson | null> {
      throw new Error('[LoaderContract.loadLesson] Not implemented.')
    },
    async loadAsset<TOptions extends LoaderOptions = LoaderOptions>(
      slug: string,
      opts?: TOptions
    ): Promise<Asset | null> {
      throw new Error('[LoaderContract.loadAsset] Not implemented.')
    },
    async listChapters<TOptions extends ChapterListOptions = ChapterListOptions>(
      opts?: TOptions
    ): Promise<Chapter[]> {
      throw new Error('[LoaderContract.listChapters] Not implemented.')
    }
  }
}

export type LoaderContract = LoaderContractMethods

export function assertContract<T>(obj: unknown): asserts obj is T {
  if (obj === null || obj === undefined) {
    throw new Error('[assertContract] Object is null or undefined')
  }
}

export function assertLoaderContract(loader: unknown): asserts loader is LoaderContractMethods {
  assertContract<LoaderContractMethods>(loader)
  const required = ['loadCourse', 'loadChapter', 'loadLesson', 'loadAsset', 'listChapters'] as const
  for (const method of required) {
    if (typeof (loader as unknown as Record<string, unknown>)[method] !== 'function') {
      throw new Error(`[LoaderContract] Missing method: ${method}`)
    }
  }
}
