import { eq, and, asc, desc } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { getDb, exercises, type DbInstance } from '@database'
import type { Exercise } from '@content/models/index'

export interface ExerciseFilters {
  chapter?: string
  chapterId?: number | string
  slug?: string
}

export interface ExerciseListOptions extends ExerciseFilters {
  orderBy?: 'id' | 'order'
  order?: 'asc' | 'desc'
}

export class ExerciseRepository {
  _explicitDb?: DbInstance | null
  table: typeof exercises

  constructor(db?: DbInstance) {
    this._explicitDb = db || null
    this.table = exercises
  }

  _getDb(): DbInstance {
    return (this._explicitDb || getDb()) as DbInstance
  }

  _buildWhere({ chapter, chapterId, slug }: ExerciseFilters = {}): SQL | undefined {
    const clauses: SQL[] = []
    if (slug) clauses.push(eq(this.table.slug, slug))
    if (chapterId) clauses.push(eq(this.table.chapterId, Number(chapterId)))
    if (chapter) clauses.push(eq(this.table.chapter, chapter))
    return clauses.length ? and(...clauses) : undefined
  }

  async list({ chapter, chapterId, orderBy = 'order', order = 'asc' }: ExerciseListOptions = {}): Promise<Exercise[]> {
    const sortDir = order.toLowerCase() === 'desc' ? desc : asc
    const sortCol = orderBy === 'id' ? this.table.id : this.table.order
    const where = this._buildWhere({ chapter, chapterId })
    let query: any = this._getDb().select().from(this.table)
    if (where) query = query.where(where)
    return query.orderBy(sortDir(sortCol))
  }

  async listByChapter(chapterSlug: string | undefined | null): Promise<Exercise[]> {
    if (!chapterSlug) return []
    return this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.chapter, chapterSlug))
      .orderBy(asc(this.table.order), asc(this.table.id))
  }

  async getBySlug(slug: string | undefined | null): Promise<Exercise | null> {
    if (!slug) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.slug, slug))
      .limit(1)
    return rows[0] || null
  }

  async getById(id: number | string | undefined | null): Promise<Exercise | null> {
    if (!id) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.id, Number(id)))
      .limit(1)
    return rows[0] || null
  }

  async getOneByChapter(chapterSlug: string | undefined | null): Promise<Exercise | null> {
    if (!chapterSlug) return null
    const list = await this.listByChapter(chapterSlug)
    return list[0] || null
  }
}

export const exerciseRepository = new ExerciseRepository()
export default exerciseRepository
