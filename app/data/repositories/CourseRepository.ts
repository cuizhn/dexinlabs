import { eq, asc, desc, sql } from 'drizzle-orm'
import { getDb, courses, type DbInstance } from '../../../drizzle/db'

type SelectCourse = typeof courses.$inferSelect
type InsertCourse = typeof courses.$inferInsert

export interface CourseListOptions {
  orderBy?: 'id' | 'order'
  order?: 'asc' | 'desc'
}

export class CourseRepository {
  _explicitDb?: DbInstance | null
  table: typeof courses

  constructor(db?: DbInstance) {
    this._explicitDb = db || null
    this.table = courses
  }

  _getDb(): DbInstance {
    return (this._explicitDb || getDb()) as DbInstance
  }

  async list({ orderBy = 'order', order = 'asc' }: CourseListOptions = {}): Promise<SelectCourse[]> {
    const sortDir = order.toLowerCase() === 'desc' ? desc : asc
    const sortCol = orderBy === 'id' ? this.table.id : this.table.order
    return this._getDb().select().from(this.table).orderBy(sortDir(sortCol))
  }

  async getBySlug(slug: string | undefined | null): Promise<SelectCourse | null> {
    if (!slug) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.slug, slug))
      .limit(1)
    return rows[0] || null
  }

  async getById(id: number | string | undefined | null): Promise<SelectCourse | null> {
    if (!id) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.id, Number(id)))
      .limit(1)
    return rows[0] || null
  }

  async getDefault(): Promise<SelectCourse | null> {
    let row = await this.getBySlug('pep-7a')
    if (!row) {
      const rows = await this._getDb()
        .select()
        .from(this.table)
        .orderBy(asc(this.table.order), asc(this.table.id))
        .limit(1)
      row = rows[0] || null
    }
    return row
  }

  async count(): Promise<number> {
    const rows = await this._getDb().select({
      count: sql<number>`count(*)`.mapWith(Number)
    }).from(this.table)
    return Number(rows[0]?.count ?? 0)
  }

  async create(data: InsertCourse): Promise<SelectCourse | null> {
    const rows = await this._getDb().insert(this.table).values(data).returning()
    return rows[0] || null
  }

  async updateBySlug(slug: string, data: Partial<Omit<InsertCourse, 'id' | 'slug' | 'createdAt'>>): Promise<SelectCourse | null> {
    const patch: Partial<InsertCourse> = { ...data, updatedAt: new Date() }
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

  async upsert(data: InsertCourse): Promise<SelectCourse | null> {
    const { id, createdAt, ...rest } = data || ({} as InsertCourse)
    const payload: Omit<InsertCourse, 'id' | 'createdAt'> = { ...rest }
    const onConflictSet: Partial<InsertCourse> = { ...rest }
    delete (onConflictSet as { slug?: unknown }).slug
    onConflictSet.updatedAt = new Date()
    const rows = await this._getDb()
      .insert(this.table)
      .values(payload as InsertCourse)
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

export const courseRepository = new CourseRepository()
export default courseRepository
