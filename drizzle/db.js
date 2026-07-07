import process from 'node:process'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool } from '@neondatabase/serverless'
import { schema } from './schema.js'

let _poolInstance = null
let _dbInstance = null

function ensureDbInitialized() {
  if (!_dbInstance) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('[drizzle/db] process.env.DATABASE_URL is empty. Ensure env var is set.')
    }
    _poolInstance = new Pool({ connectionString })
    _dbInstance = drizzle(_poolInstance, { schema })
  }
  return _dbInstance
}

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
  return ensureDbInitialized()
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

const dbOperations = ['select', 'insert', 'update', 'delete', 'execute', 'query', 'run']

export const db = new Proxy({}, {
  get(_target, prop, _receiver) {
    if (typeof prop === 'symbol') {
      return undefined
    }
    if (dbOperations.includes(prop) || prop === 'transaction') {
      return (...args) => ensureDbInitialized()[prop](...args)
    }
    return Reflect.get(ensureDbInitialized(), prop)
  },
  has(_target, prop) {
    return prop in ensureDbInitialized()
  },
  ownKeys() {
    return Object.keys(ensureDbInitialized())
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Object.getOwnPropertyDescriptor(ensureDbInitialized(), prop)
  }
})

export * from './schema.js'
export { schema }
export default { db, getDb, createDb, closeDb, schema }
