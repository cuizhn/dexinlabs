import process from 'node:process'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool, type PoolConfig } from '@neondatabase/serverless'
import * as schema from './schema'

type Schema = typeof schema
export type DbInstance = ReturnType<typeof drizzle<Schema>>

let _poolInstance: Pool | null = null
let _dbInstance: DbInstance | null = null

function ensureDbInitialized(): DbInstance {
  if (!_dbInstance) {
    const connectionString: string | undefined = process.env.DATABASE_URL
    if (!connectionString) {
      const err = new Error(
        '[app/core/database/connection] process.env.DATABASE_URL is empty. ' +
        'Please set the DATABASE_URL environment variable. ' +
        'If you are on Vercel, configure it in Project → Settings → Environment Variables.'
      )
      ;(err as Error & { code?: string }).code = 'DATABASE_URL_MISSING'
      throw err
    }
    const poolConfig: PoolConfig = { connectionString }
    _poolInstance = new Pool(poolConfig)
    _dbInstance = drizzle(_poolInstance, { schema })
  }
  return _dbInstance
}

export interface CreateDbOptions {
  connectionString?: string
  pool?: Pool
}

export function createDb(options: CreateDbOptions = {}): DbInstance {
  const connectionString: string | undefined =
    options.connectionString || process.env.DATABASE_URL
  if (!connectionString) {
    const err = new Error(
      '[app/core/database/connection] DATABASE_URL is missing. ' +
      'Either set env DATABASE_URL or pass connectionString explicitly to createDb().'
    )
    ;(err as Error & { code?: string }).code = 'DATABASE_URL_MISSING'
    throw err
  }
  const pool: Pool = options.pool || new Pool({ connectionString })
  return drizzle(pool, { schema })
}

export function getDb(): DbInstance {
  return ensureDbInitialized()
}

export async function closeDb(): Promise<void> {
  if (_poolInstance) {
    try {
      await _poolInstance.end()
    } catch {
      // ignore errors on cleanup
    } finally {
      _poolInstance = null
      _dbInstance = null
    }
  }
}

type DbKey =
  | 'select'
  | 'insert'
  | 'update'
  | 'delete'
  | 'execute'
  | 'query'
  | 'run'
  | 'transaction'

const dbOperations: DbKey[] = [
  'select',
  'insert',
  'update',
  'delete',
  'execute',
  'query',
  'run'
]

function safeEnsureDbInitialized(): DbInstance | null {
  try {
    return ensureDbInitialized()
  } catch (e) {
    if (e && (e as Error & { code?: string }).code === 'DATABASE_URL_MISSING') {
      return null
    }
    throw e
  }
}

export const db: DbInstance = new Proxy<DbInstance>({} as unknown as DbInstance, {
  get<K extends keyof DbInstance>(_target: DbInstance, prop: string | symbol, _receiver: unknown): DbInstance[K] | undefined {
    if (typeof prop === 'symbol') {
      return undefined as unknown as DbInstance[K]
    }
    const key = prop as DbKey | string
    const instance = safeEnsureDbInitialized()
    if (!instance) {
      if (dbOperations.includes(key as DbKey) || key === 'transaction') {
        return ((() => {
          throw Object.assign(
            new Error('[app/core/database/db] DATABASE_URL missing — cannot run DB operation. Set env DATABASE_URL.'),
            { code: 'DATABASE_URL_MISSING' }
          )
        }) as unknown) as DbInstance[K]
      }
      return undefined as unknown as DbInstance[K]
    }
    if (dbOperations.includes(key as DbKey) || key === 'transaction') {
      const fn = instance[prop as keyof DbInstance] as unknown as (...args: unknown[]) => unknown
      if (typeof fn === 'function') {
        return ((...args: unknown[]) => fn.apply(instance, args)) as unknown as DbInstance[K]
      }
      return fn as unknown as DbInstance[K]
    }
    return Reflect.get(instance, prop) as DbInstance[K]
  },

  has(_target: DbInstance, prop: string | symbol): boolean {
    const instance = safeEnsureDbInitialized()
    return instance ? prop in instance : false
  },

  ownKeys(_target: DbInstance): ArrayLike<string | symbol> {
    const instance = safeEnsureDbInitialized()
    return instance ? Object.keys(instance) : []
  },

  getOwnPropertyDescriptor(
    _target: DbInstance,
    prop: string | symbol
  ): PropertyDescriptor | undefined {
    const instance = safeEnsureDbInitialized()
    return instance ? Object.getOwnPropertyDescriptor(instance, prop) : undefined
  }
})

export { schema }
export default { db, getDb, createDb, closeDb, schema }
