export type SupportedCollection = 'course' | 'chapter' | 'lesson' | 'exercise' | 'asset'

export interface SourceWhereClause {
  [key: string]: unknown
}

export interface SourceFindAllOptions {
  where?: SourceWhereClause
  orderBy?: string | string[]
  limit?: number
  offset?: number
  [key: string]: unknown
}

export interface SourceContractMethods {
  findOne<T = unknown>(collection: SupportedCollection, where?: SourceWhereClause): Promise<T | null>
  findAll<T = unknown>(collection: SupportedCollection, opts?: SourceFindAllOptions): Promise<T[]>
  count(collection: SupportedCollection, where?: SourceWhereClause): Promise<number>
}

export interface SourceContractDefinition {
  name: string
  description: string
  methods: SourceContractMethods
  supportedCollections: SupportedCollection[]
}

export const SourceContract: SourceContractDefinition = {
  name: 'Source',

  description: '唯一职责：获取内容原始数据。不解析、不渲染、不做业务聚合。',

  methods: {
    async findOne<T = unknown>(collection: SupportedCollection, where: SourceWhereClause = {}): Promise<T | null> {
      throw new Error('[SourceContract.findOne] Must be implemented by a concrete source.')
    },

    async findAll<T = unknown>(collection: SupportedCollection, opts: SourceFindAllOptions = {}): Promise<T[]> {
      throw new Error('[SourceContract.findAll] Must be implemented by a concrete source.')
    },

    async count(collection: SupportedCollection, where: SourceWhereClause = {}): Promise<number> {
      throw new Error('[SourceContract.count] Must be implemented by a concrete source.')
    }
  },

  supportedCollections: ['course', 'chapter', 'lesson', 'exercise', 'asset']
}

export type SourceContract = SourceContractMethods

export function assertContract<T>(obj: unknown): asserts obj is T {
  if (obj === null || obj === undefined) {
    throw new Error('[assertContract] Object is null or undefined')
  }
}

export function assertSourceContract(source: unknown): asserts source is SourceContractMethods {
  assertContract<SourceContractMethods>(source)
  const required = ['findOne', 'findAll', 'count'] as const
  for (const method of required) {
    if (typeof (source as unknown as Record<string, unknown>)[method] !== 'function') {
      throw new Error(`[SourceContract] Missing method: ${method}`)
    }
  }
}
