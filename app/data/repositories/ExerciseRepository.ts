import { eq, and, or, asc, desc, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { getDb, exercises, chapters, type DbInstance } from '../../../drizzle/db'
import type { Exercise } from '../../../content-engine/models/index'

type SelectExercise = Exercise
type InsertExercise = typeof exercises.$inferInsert

export interface ExerciseFilters {
  chapter?: string
  chapterId?: number | string
  slug?: string
}

export interface ExerciseListOptions extends ExerciseFilters {
  orderBy?: 'id' | 'order'
  order?: 'asc' | 'desc'
}

export interface ExerciseListByChapterRow {
  id: SelectExercise['id']
  slug: SelectExercise['slug']
  title: SelectExercise['title']
  summary: SelectExercise['summary']
  description: SelectExercise['description']
  body: SelectExercise['body']
  order: SelectExercise['order']
  chapter: SelectExercise['chapter']
  hint: SelectExercise['hint']
  answer: SelectExercise['answer']
  analysis: SelectExercise['analysis']
  chapterId: SelectExercise['chapterId']
  createdAt: SelectExercise['createdAt']
  updatedAt: SelectExercise['updatedAt']
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

  async list({ chapter, chapterId, orderBy = 'order', order = 'asc' }: ExerciseListOptions = {}): Promise<SelectExercise[]> {
    const sortDir = order.toLowerCase() === 'desc' ? desc : asc
    const sortCol = orderBy === 'id' ? this.table.id : this.table.order
    const where = this._buildWhere({ chapter, chapterId })
    let query: any = this._getDb().select().from(this.table)
    if (where) query = query.where(where)
    return query.orderBy(sortDir(sortCol))
  }

  async listByChapter(chapterSlug: string | undefined | null): Promise<ExerciseListByChapterRow[]> {
    if (!chapterSlug) return []
    const rows = await this._getDb()
      .select({
        id: this.table.id,
        slug: this.table.slug,
        title: this.table.title,
        summary: this.table.summary,
        description: this.table.description,
        body: this.table.body,
        order: this.table.order,
        chapter: this.table.chapter,
        hint: this.table.hint,
        answer: this.table.answer,
        analysis: this.table.analysis,
        chapterId: this.table.chapterId,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt
      })
      .from(this.table)
      .leftJoin(chapters, eq(this.table.chapterId, chapters.id))
      .where(
        or(
          eq(this.table.chapter, chapterSlug),
          eq(chapters.slug, chapterSlug)
        )
      )
      .orderBy(asc(this.table.order), asc(this.table.id))
    return rows
  }

  async getBySlug(slug: string | undefined | null): Promise<SelectExercise | null> {
    if (!slug) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.slug, slug))
      .limit(1)
    return rows[0] || null
  }

  async getById(id: number | string | undefined | null): Promise<SelectExercise | null> {
    if (!id) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.id, Number(id)))
      .limit(1)
    return rows[0] || null
  }

  async getOneByChapter(chapterSlug: string | undefined | null): Promise<ExerciseListByChapterRow | null> {
    if (!chapterSlug) return null
    const list = await this.listByChapter(chapterSlug)
    return list[0] || null
  }

  async count(filters: ExerciseFilters = {}): Promise<number> {
    const where = this._buildWhere(filters)
    let query: any = this._getDb().select({ count: sql<number>`count(*)`.mapWith(Number) }).from(this.table)
    if (where) query = query.where(where)
    const rows = await query
    return Number(rows[0]?.count ?? 0)
  }

  async create(data: InsertExercise): Promise<SelectExercise | null> {
    const rows = await this._getDb().insert(this.table).values(data).returning()
    return rows[0] || null
  }

  async updateBySlug(slug: string, data: Partial<Omit<InsertExercise, 'id' | 'slug' | 'createdAt'>>): Promise<SelectExercise | null> {
    const patch: Partial<InsertExercise> = { ...data, updatedAt: new Date() }
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

  async upsert(data: InsertExercise): Promise<SelectExercise | null> {
    const { id, createdAt, ...rest } = data || ({} as InsertExercise)
    const payload: Omit<InsertExercise, 'id' | 'createdAt'> = { ...rest }
    const onConflictSet: Partial<InsertExercise> = { ...rest }
    delete (onConflictSet as { slug?: unknown }).slug
    onConflictSet.updatedAt = new Date()
    const rows = await this._getDb()
      .insert(this.table)
      .values(payload as InsertExercise)
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

export const exerciseRepository = new ExerciseRepository()
export default exerciseRepository
