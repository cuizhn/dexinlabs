import { eq, and, or, asc, desc, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { getDb, chapters, courses, type DbInstance } from '../../../drizzle/db'

type SelectChapter = typeof chapters.$inferSelect
type InsertChapter = typeof chapters.$inferInsert

export interface ChapterFilters {
  course?: string
  courseId?: number | string
  slug?: string
}

export interface ChapterListOptions extends ChapterFilters {
  orderBy?: 'id' | 'order'
  order?: 'asc' | 'desc'
}

export interface ChapterListByCourseRow {
  id: SelectChapter['id']
  slug: SelectChapter['slug']
  title: SelectChapter['title']
  summary: SelectChapter['summary']
  order: SelectChapter['order']
  course: SelectChapter['course']
  cover: SelectChapter['cover']
  body: SelectChapter['body']
  courseId: SelectChapter['courseId']
  createdAt: SelectChapter['createdAt']
  updatedAt: SelectChapter['updatedAt']
}

export class ChapterRepository {
  _explicitDb?: DbInstance | null
  table: typeof chapters

  constructor(db?: DbInstance) {
    this._explicitDb = db || null
    this.table = chapters
  }

  _getDb(): DbInstance {
    return (this._explicitDb || getDb()) as DbInstance
  }

  _buildWhere({ course, courseId, slug }: ChapterFilters = {}): SQL | undefined {
    const clauses: SQL[] = []
    if (slug) clauses.push(eq(this.table.slug, slug))
    if (courseId) clauses.push(eq(this.table.courseId, Number(courseId)))
    if (course) clauses.push(eq(this.table.course, course))
    return clauses.length ? and(...clauses) : undefined
  }

  async list({ course, courseId, orderBy = 'order', order = 'asc' }: ChapterListOptions = {}): Promise<SelectChapter[]> {
    const sortDir = order.toLowerCase() === 'desc' ? desc : asc
    const sortCol = orderBy === 'id' ? this.table.id : this.table.order
    const where = this._buildWhere({ course, courseId })
    let query: any = this._getDb().select().from(this.table)
    if (where) query = query.where(where)
    return query.orderBy(sortDir(sortCol))
  }

  async listByCourse(courseSlug: string | undefined | null): Promise<ChapterListByCourseRow[]> {
    if (!courseSlug) return []
    const rows = await this._getDb()
      .select({
        id: this.table.id,
        slug: this.table.slug,
        title: this.table.title,
        summary: this.table.summary,
        order: this.table.order,
        course: this.table.course,
        cover: this.table.cover,
        body: this.table.body,
        courseId: this.table.courseId,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt
      })
      .from(this.table)
      .leftJoin(courses, eq(this.table.courseId, courses.id))
      .where(
        or(
          eq(this.table.course, courseSlug),
          eq(courses.slug, courseSlug)
        )
      )
      .orderBy(asc(this.table.order), asc(this.table.id))
    return rows
  }

  async getBySlug(slug: string | undefined | null): Promise<SelectChapter | null> {
    if (!slug) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.slug, slug))
      .limit(1)
    return rows[0] || null
  }

  async getById(id: number | string | undefined | null): Promise<SelectChapter | null> {
    if (!id) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.id, Number(id)))
      .limit(1)
    return rows[0] || null
  }

  async count(filters: ChapterFilters = {}): Promise<number> {
    const where = this._buildWhere(filters)
    let query: any = this._getDb().select({ count: sql<number>`count(*)`.mapWith(Number) }).from(this.table)
    if (where) query = query.where(where)
    const rows = await query
    return Number(rows[0]?.count ?? 0)
  }

  async create(data: InsertChapter): Promise<SelectChapter | null> {
    const rows = await this._getDb().insert(this.table).values(data).returning()
    return rows[0] || null
  }

  async updateBySlug(slug: string, data: Partial<Omit<InsertChapter, 'id' | 'slug' | 'createdAt'>>): Promise<SelectChapter | null> {
    const patch: Partial<InsertChapter> = { ...data, updatedAt: new Date() }
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

  async upsert(data: InsertChapter): Promise<SelectChapter | null> {
    const { id, createdAt, ...rest } = data || ({} as InsertChapter)
    const payload: Omit<InsertChapter, 'id' | 'createdAt'> = { ...rest }
    const onConflictSet: Partial<InsertChapter> = { ...rest }
    delete (onConflictSet as { slug?: unknown }).slug
    onConflictSet.updatedAt = new Date()
    const rows = await this._getDb()
      .insert(this.table)
      .values(payload as InsertChapter)
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

export const chapterRepository = new ChapterRepository()
export default chapterRepository
