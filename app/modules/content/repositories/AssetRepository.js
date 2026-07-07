import { eq, asc, desc, sql } from 'drizzle-orm'
import { getDb } from '../../../../drizzle/db.js'
import { assets } from '../../../../drizzle/schema.js'

export class AssetRepository {
  constructor(db) {
    this._explicitDb = db || null
    this.table = assets
  }

  _getDb() {
    return this._explicitDb || getDb()
  }

  async list({ type, orderBy = 'id', order = 'asc' } = {}) {
    const sortDir = order.toLowerCase() === 'desc' ? desc : asc
    let query = this._getDb().select().from(this.table)
    if (type) query = query.where(eq(this.table.type, type))
    return query.orderBy(sortDir(this.table[orderBy] || this.table.id))
  }

  async getBySlug(slug) {
    if (!slug) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.slug, slug))
      .limit(1)
    return rows[0] || null
  }

  async getById(id) {
    if (!id) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.id, Number(id)))
      .limit(1)
    return rows[0] || null
  }

  async count() {
    const rows = await this._getDb().select({
      count: sql`count(*)`.mapWith(Number)
    }).from(this.table)
    return Number(rows[0]?.count ?? 0)
  }

  async create(data) {
    const rows = await this._getDb().insert(this.table).values(data).returning()
    return rows[0] || null
  }

  async updateBySlug(slug, data) {
    const patch = { ...data, updatedAt: new Date() }
    delete patch.id
    delete patch.slug
    delete patch.createdAt
    const rows = await this._getDb()
      .update(this.table)
      .set(patch)
      .where(eq(this.table.slug, slug))
      .returning()
    return rows[0] || null
  }

  async upsert(data) {
    const { id, createdAt, ...rest } = data || {}
    const payload = { ...rest }
    const onConflictSet = { ...rest }
    delete onConflictSet.slug
    onConflictSet.updatedAt = new Date()
    const rows = await this._getDb()
      .insert(this.table)
      .values(payload)
      .onConflictDoUpdate({
        target: this.table.slug,
        set: onConflictSet
      })
      .returning()
    return rows[0] || null
  }

  async deleteBySlug(slug) {
    return this._getDb().delete(this.table).where(eq(this.table.slug, slug))
  }
}

export const assetRepository = new AssetRepository()
export default assetRepository
