import { eq, and, or, asc, desc, sql } from 'drizzle-orm'
import { getDb } from '../../../../drizzle/db.js'
import { chapters, courses } from '../../../../drizzle/schema.js'

export class ChapterRepository {
  constructor(db) {
    this._explicitDb = db || null
    this.table = chapters
  }

  get db() {
    return this._explicitDb || getDb()
  }

  _buildWhere({ course, courseId, slug } = {}) {
    const clauses = []
    if (slug) clauses.push(eq(this.table.slug, slug))
    if (courseId) clauses.push(eq(this.table.courseId, Number(courseId)))
    if (course) clauses.push(eq(this.table.course, course))
    return clauses.length ? and(...clauses) : undefined
  }

  async list({ course, courseId, orderBy = 'order', order = 'asc' } = {}) {
    const sortDir = order.toLowerCase() === 'desc' ? desc : asc
    const sortCol = orderBy === 'id' ? this.table.id : this.table.order
    const where = this._buildWhere({ course, courseId })
    let query = this.db.select().from(this.table)
    if (where) query = query.where(where)
    return query.orderBy(sortDir(sortCol))
  }

  async listByCourse(courseSlug) {
    if (!courseSlug) return []
    const rows = await this.db
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

  async count(filters = {}) {
    const where = this._buildWhere(filters)
    let query = this._getDb().select({ count: sql`count(*)`.mapWith(Number) }).from(this.table)
    if (where) query = query.where(where)
    const rows = await query
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

export const chapterRepository = new ChapterRepository()
export default chapterRepository
