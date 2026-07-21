import { eq, asc } from 'drizzle-orm'
import { getDb, lessons, type DbInstance } from '@database'
import type { Lesson, Chapter, Course } from '@content/models/index'

export interface LessonWithRelations extends Lesson {
  chapterEntity: Chapter | null
  courseEntity: Course | null
  siblingLessons: Lesson[]
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

  async list(): Promise<Lesson[]> {
    return this._getDb().select().from(this.table).orderBy(asc(this.table.order), asc(this.table.id))
  }

  async listByChapter(chapterSlug: string | undefined | null): Promise<Lesson[]> {
    if (!chapterSlug) return []
    return this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.chapter, chapterSlug))
      .orderBy(asc(this.table.order), asc(this.table.id))
  }

  async getBySlug(slug: string | undefined | null): Promise<Lesson | null> {
    if (!slug) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.slug, slug))
      .limit(1)
    return rows[0] || null
  }

  async getById(id: number | string | undefined | null): Promise<Lesson | null> {
    if (!id) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.id, Number(id)))
      .limit(1)
    return rows[0] || null
  }

  async getWithChapterAndCourse(slug: string): Promise<LessonWithRelations | null> {
    if (!slug) return null
    const result = await this._getDb().query.lessons.findFirst({
      where: eq(this.table.slug, slug),
      with: {
        chapterRef: {
          with: {
            courseRef: true,
            lessons: {
              orderBy: (lessons, { asc }) => [asc(lessons.order), asc(lessons.id)]
            }
          }
        }
      }
    })
    if (!result) return null
    const chapterRef = result.chapterRef as any
    return {
      ...result,
      chapterEntity: result.chapterRef || null,
      courseEntity: chapterRef?.courseRef || null,
      siblingLessons: chapterRef?.lessons || []
    } as unknown as LessonWithRelations
  }
}

export const lessonRepository = new LessonRepository()
export default lessonRepository
