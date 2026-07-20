import { eq, asc } from 'drizzle-orm'
import { getDb, courses, type DbInstance } from '@database'
import type { Course, Chapter, Lesson } from '@content/models/index'

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

  async list(): Promise<Course[]> {
    return this._getDb().select().from(this.table).orderBy(asc(this.table.order), asc(this.table.id))
  }

  async getBySlug(slug: string | undefined | null): Promise<Course | null> {
    if (!slug) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.slug, slug))
      .limit(1)
    return rows[0] || null
  }

  async getById(id: number | string | undefined | null): Promise<Course | null> {
    if (!id) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.id, Number(id)))
      .limit(1)
    return rows[0] || null
  }

  async getDefault(): Promise<Course | null> {
    let row = await this.getBySlug('pep-9a')
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

  async getWithChaptersAndLessons(slug: string): Promise<(Course & { chapters: (Chapter & { lessons: Lesson[] })[] }) | null> {
    if (!slug) return null
    const result = await this._getDb().query.courses.findFirst({
      where: eq(this.table.slug, slug),
      with: {
        chapters: {
          with: {
            lessons: true
          },
          orderBy: (chapters, { asc }) => [asc(chapters.order), asc(chapters.id)]
        }
      }
    })
    return result as unknown as (Course & { chapters: (Chapter & { lessons: Lesson[] })[] }) | null
  }
}

export const courseRepository = new CourseRepository()
export default courseRepository
