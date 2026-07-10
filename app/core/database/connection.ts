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
      throw new Error('[server/database/connection] process.env.DATABASE_URL is empty. Ensure env var is set.')
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
    throw new Error(
      '[server/database/connection] DATABASE_URL is missing. Either set env DATABASE_URL or pass connectionString explicitly.'
    )
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

export const db: DbInstance = new Proxy<DbInstance>({} as unknown as DbInstance, {
  get<K extends keyof DbInstance>(_target: DbInstance, prop: string | symbol, _receiver: unknown): DbInstance[K] | undefined {
    if (typeof prop === 'symbol') {
      return undefined as unknown as DbInstance[K]
    }
    const key = prop as DbKey | string
    if (dbOperations.includes(key as DbKey) || key === 'transaction') {
      const instance = ensureDbInitialized()
      const fn = instance[prop as keyof DbInstance] as unknown as (...args: unknown[]) => unknown
      if (typeof fn === 'function') {
        return ((...args: unknown[]) =>
          fn.apply(instance, args)) as unknown as DbInstance[K]
      }
      return fn as unknown as DbInstance[K]
    }
    return Reflect.get(ensureDbInitialized(), prop) as DbInstance[K]
  },

  has(_target: DbInstance, prop: string | symbol): boolean {
    return prop in ensureDbInitialized()
  },

  ownKeys(_target: DbInstance): ArrayLike<string | symbol> {
    return Object.keys(ensureDbInitialized())
  },

  getOwnPropertyDescriptor(
    _target: DbInstance,
    prop: string | symbol
  ): PropertyDescriptor | undefined {
    return Object.getOwnPropertyDescriptor(ensureDbInitialized(), prop)
  }
})

export { schema }
export default { db, getDb, createDb, closeDb, schema }
