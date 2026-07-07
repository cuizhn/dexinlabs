import { eq, and, asc, desc, sql } from 'drizzle-orm'
import { SourceContract } from '@modules/content/contracts/Source'
import { getDb } from '../../../../drizzle/db.js'
import {
  courses,
  chapters,
  lessons,
  exercises,
  assets
} from '../../../../drizzle/schema.js'

const COLLECTION_TO_TABLE = {
  course: courses,
  courses: courses,
  chapter: chapters,
  chapters: chapters,
  lesson: lessons,
  lessons: lessons,
  exercise: exercises,
  exercises: exercises,
  asset: assets,
  assets: assets
}

function resolveTable(collection) {
  if (!collection) return null
  const key = String(collection).toLowerCase()
  return COLLECTION_TO_TABLE[key] || COLLECTION_TO_TABLE[key.replace(/s$/, '')] || null
}

function castPrimitiveId(v) {
  if (v == null) return null
  if (typeof v === 'number') return v
  if (typeof v === 'bigint') return Number(v)
  const s = String(v)
  const n = parseInt(s, 10)
  if (!Number.isNaN(n) && String(n) === s) return n
  return v
}

function buildWhereFromCriteria(table, criteria = {}) {
  const clauses = []
  const entries = Object.entries(criteria)
  for (const [k, v] of entries) {
    if (v == null) continue
    const col = table[k]
    if (!col) continue
    const value = (k === 'id' || k.endsWith('Id')) ? castPrimitiveId(v) : v
    clauses.push(eq(col, value))
  }
  return clauses.length ? and(...clauses) : undefined
}

function buildOrderClauses(table, order = {}) {
  if (!order) return [asc(table.id)]
  if (Array.isArray(order)) {
    return order.map(o => {
      if (!o) return asc(table.id)
      const [field, dir] = Object.entries(o)[0] || ['id', 'asc']
      const direction = String(dir).toLowerCase() === 'desc' ? desc : asc
      return direction(table[field] || table.id)
    })
  }
  const { field = 'id', dir = 'asc' } = order
  const direction = String(dir).toLowerCase() === 'desc' ? desc : asc
  return [direction(table[field] || table.id), asc(table.id)]
}

export class DatabaseSource {
  constructor(connectionOrOpts = {}) {
    this.connection = connectionOrOpts
    this.name = 'database'
  }

  _getDb() {
    return this.connection?.db || this.connection || getDb()
  }

  async findOne(collection, where = {}) {
    const table = resolveTable(collection)
    const db = this._getDb()
    if (!table) return null
    const criteria = buildWhereFromCriteria(table, where)
    let query = db.select().from(table)
    if (criteria) query = query.where(criteria)
    const rows = await query.limit(1).catch(() => [])
    return rows[0] || null
  }

  async findAll(collection, opts = {}) {
    const table = resolveTable(collection)
    const db = this._getDb()
    if (!table) return []
    const where = buildWhereFromCriteria(table, opts.where || {})
    const orderBy = buildOrderClauses(table, opts.order)
    let query = db.select().from(table)
    if (where) query = query.where(where)
    query = query.orderBy(...orderBy)
    if (typeof opts.limit === 'number') query = query.limit(opts.limit)
    if (typeof opts.offset === 'number') query = query.offset(opts.offset)
    return query.catch(() => [])
  }

  async count(collection, where = {}) {
    const table = resolveTable(collection)
    const db = this._getDb()
    if (!table) return 0
    const criteria = buildWhereFromCriteria(table, where)
    let query = db.select({ count: sql`count(*)`.mapWith(Number) }).from(table)
    if (criteria) query = query.where(criteria)
    const rows = await query.catch(() => [{ count: 0 }])
    return Number(rows[0]?.count ?? 0)
  }

  static get contract() {
    return SourceContract
  }
}

export default DatabaseSource
