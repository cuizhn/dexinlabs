import { eq, asc, desc, sql } from 'drizzle-orm'
import { getDb, courses, type DbInstance } from '../index'
import type { Course } from '@content/models/index'

type SelectCourse = Course

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
}

export const courseRepository = new CourseRepository()
export default courseRepository
