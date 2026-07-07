import process from 'node:process'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool } from '@neondatabase/serverless'
import { schema } from './schema.js'

let _poolInstance = null
let _dbInstance = null

export function createDb(options = {}) {
  const connectionString = options.connectionString || process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      '[drizzle/db] DATABASE_URL is missing. Either set env DATABASE_URL or pass connectionString explicitly.'
    )
  }
  const pool = options.pool || new Pool({ connectionString })
  return drizzle(pool, { schema })
}

export function getDb() {
  if (!_dbInstance) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('[drizzle/db] process.env.DATABASE_URL is empty. Load .env (dotenv) BEFORE calling getDb().')
    }
    _poolInstance = new Pool({ connectionString })
    _dbInstance = drizzle(_poolInstance, { schema })
  }
  return _dbInstance
}

export async function closeDb() {
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

export const db = new Proxy({}, {
  get(_target, prop, _receiver) {
    return Reflect.get(getDb(), prop)
  }
})

export * from './schema.js'
export { schema }
export default { db, getDb, createDb, closeDb, schema }
