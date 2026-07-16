import { eq, asc, desc, sql } from 'drizzle-orm'
import { getDb, assets, type DbInstance } from '../index'
import type { Asset } from '@content/models/index'

type SelectAsset = Asset

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
}

export const assetRepository = new AssetRepository()
export default assetRepository
