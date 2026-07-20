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
      throw new Error('[database/connection] process.env.DATABASE_URL is empty. Ensure env var is set.')
    }
    const poolConfig: PoolConfig = { connectionString }
    _poolInstance = new Pool(poolConfig)
    _dbInstance = drizzle(_poolInstance, { schema })
  }
  return _dbInstance
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

export { schema }
export default { getDb, closeDb, schema }
