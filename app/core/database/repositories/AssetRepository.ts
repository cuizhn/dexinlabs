import { eq, asc, desc, sql } from 'drizzle-orm'
import { getDb, assets, type DbInstance } from '../index'
import type { Asset } from '../../content-engine/models/index'

type SelectAsset = Asset
type InsertAsset = typeof assets.$inferInsert

export interface AssetListOptions {
  type?: string
  orderBy?: keyof SelectAsset
  order?: 'asc' | 'desc'
}

export class AssetRepository {
  _explicitDb?: DbInstance | null
  table: typeof assets

  constructor(db?: DbInstance) {
    this._explicitDb = db || null
    this.table = assets
  }

  _getDb(): DbInstance {
    return (this._explicitDb || getDb()) as DbInstance
  }

  async list({ type, orderBy = 'id', order = 'asc' }: AssetListOptions = {}): Promise<SelectAsset[]> {
    const sortDir = order.toLowerCase() === 'desc' ? desc : asc
    let query: any = this._getDb().select().from(this.table)
    if (type) query = query.where(eq(this.table.type, type))
    const sortColumn = (this.table[orderBy] || this.table.id)
    return query.orderBy(sortDir(sortColumn))
  }

  async getBySlug(slug: string | undefined | null): Promise<SelectAsset | null> {
    if (!slug) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.slug, slug))
      .limit(1)
    return rows[0] || null
  }

  async getById(id: number | string | undefined | null): Promise<SelectAsset | null> {
    if (!id) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.id, Number(id)))
      .limit(1)
    return rows[0] || null
  }

  async count(): Promise<number> {
    const rows = await this._getDb().select({
      count: sql<number>`count(*)`.mapWith(Number)
    }).from(this.table)
    return Number(rows[0]?.count ?? 0)
  }

  async create(data: InsertAsset): Promise<SelectAsset | null> {
    const rows = await this._getDb().insert(this.table).values(data).returning()
    return rows[0] || null
  }

  async updateBySlug(slug: string, data: Partial<Omit<InsertAsset, 'id' | 'slug' | 'createdAt'>>): Promise<SelectAsset | null> {
    const patch: Partial<InsertAsset> = { ...data, updatedAt: new Date() }
    delete (patch as { id?: unknown }).id
    delete (patch as { slug?: unknown }).slug
    delete (patch as { createdAt?: unknown }).createdAt
    const rows = await this._getDb()
      .update(this.table)
      .set(patch)
      .where(eq(this.table.slug, slug))
      .returning()
    return rows[0] || null
  }

  async upsert(data: InsertAsset): Promise<SelectAsset | null> {
    const { id, createdAt, ...rest } = data || ({} as InsertAsset)
    const payload: Omit<InsertAsset, 'id' | 'createdAt'> = { ...rest }
    const onConflictSet: Partial<InsertAsset> = { ...rest }
    delete (onConflictSet as { slug?: unknown }).slug
    onConflictSet.updatedAt = new Date()
    const rows = await this._getDb()
      .insert(this.table)
      .values(payload as InsertAsset)
      .onConflictDoUpdate({
        target: this.table.slug,
        set: onConflictSet
      })
      .returning()
    return rows[0] || null
  }

  async deleteBySlug(slug: string): Promise<{ rowCount: number | null }> {
    return this._getDb().delete(this.table).where(eq(this.table.slug, slug))
  }
}

export const assetRepository = new AssetRepository()
export default assetRepository
