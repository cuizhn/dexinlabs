import { eq, and, or, asc, desc, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { getDb, lessons, chapters, type DbInstance } from '../index'
import type { Lesson } from '@content/models/index'

type SelectLesson = Lesson

export interface LessonFilters {
  chapter?: string
  chapterId?: number | string
  slug?: string
}

export interface LessonListOptions extends LessonFilters {
  orderBy?: 'id' | 'order'
  order?: 'asc' | 'desc'
}

export interface LessonListByChapterRow {
  id: SelectLesson['id']
  slug: SelectLesson['slug']
  title: SelectLesson['title']
  summary: SelectLesson['summary']
  order: SelectLesson['order']
  chapter: SelectLesson['chapter']
  objectives: SelectLesson['objectives']
  intro: SelectLesson['intro']
  body: SelectLesson['body']
  summaryText: SelectLesson['summaryText']
  notes: SelectLesson['notes']
  chapterId: SelectLesson['chapterId']
  createdAt: SelectLesson['createdAt']
  updatedAt: SelectLesson['updatedAt']
}

export class LessonRepository {
  _explicitDb?: DbInstance | null
  table: typeof lessons

  constructor(db?: DbInstance) {
    this._explicitDb = db || null
    this.table = lessons
  }

  _getDb(): DbInstance {
    return (this._explicitDb || getDb()) as DbInstance
  }

  _buildWhere({ chapter, chapterId, slug }: LessonFilters = {}): SQL | undefined {
    const clauses: SQL[] = []
    if (slug) clauses.push(eq(this.table.slug, slug))
    if (chapterId) clauses.push(eq(this.table.chapterId, Number(chapterId)))
    if (chapter) clauses.push(eq(this.table.chapter, chapter))
    return clauses.length ? and(...clauses) : undefined
  }

  async list({ chapter, chapterId, orderBy = 'order', order = 'asc' }: LessonListOptions = {}): Promise<SelectLesson[]> {
    const sortDir = order.toLowerCase() === 'desc' ? desc : asc
    const sortCol = orderBy === 'id' ? this.table.id : this.table.order
    const where = this._buildWhere({ chapter, chapterId })
    let query: any = this._getDb().select().from(this.table)
    if (where) query = query.where(where)
    return query.orderBy(sortDir(sortCol))
  }

  async listByChapter(chapterSlug: string | undefined | null): Promise<LessonListByChapterRow[]> {
    if (!chapterSlug) return []
    const rows = await this._getDb()
      .select({
        id: this.table.id,
        slug: this.table.slug,
        title: this.table.title,
        summary: this.table.summary,
        order: this.table.order,
        chapter: this.table.chapter,
        objectives: this.table.objectives,
        intro: this.table.intro,
        body: this.table.body,
        summaryText: this.table.summaryText,
        notes: this.table.notes,
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

  async getBySlug(slug: string | undefined | null): Promise<SelectLesson | null> {
    if (!slug) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.slug, slug))
      .limit(1)
    return rows[0] || null
  }

  async getById(id: number | string | undefined | null): Promise<SelectLesson | null> {
    if (!id) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.id, Number(id)))
      .limit(1)
    return rows[0] || null
  }

  async count(filters: LessonFilters = {}): Promise<number> {
    const where = this._buildWhere(filters)
    let query: any = this._getDb().select({ count: sql<number>`count(*)`.mapWith(Number) }).from(this.table)
    if (where) query = query.where(where)
    const rows = await query
    return Number(rows[0]?.count ?? 0)
  }
}

export const lessonRepository = new LessonRepository()
export default lessonRepository
