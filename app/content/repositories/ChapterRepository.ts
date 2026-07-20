import { eq, asc, or } from 'drizzle-orm'
import { getDb, chapters, courses, type DbInstance } from '@database'
import type { Chapter, Course, Lesson, Exercise } from '@content/models/index'

export interface ChapterWithRelations extends Chapter {
  courseEntity: Course | null
  lessonList: Lesson[]
  exerciseEntity: Exercise | null
  siblingChapters: Chapter[]
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

  async list(): Promise<Chapter[]> {
    return this._getDb().select().from(this.table).orderBy(asc(this.table.order), asc(this.table.id))
  }

  async listByCourse(courseSlug: string | undefined | null): Promise<Chapter[]> {
    if (!courseSlug) return []
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .leftJoin(courses, eq(this.table.courseId, courses.id))
      .where(or(eq(this.table.course, courseSlug), eq(courses.slug, courseSlug)))
      .orderBy(asc(this.table.order), asc(this.table.id))
    return rows as unknown as Chapter[]
  }

  async getBySlug(slug: string | undefined | null): Promise<Chapter | null> {
    if (!slug) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.slug, slug))
      .limit(1)
    return rows[0] || null
  }

  async getById(id: number | string | undefined | null): Promise<Chapter | null> {
    if (!id) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.id, Number(id)))
      .limit(1)
    return rows[0] || null
  }

  async getWithLessonsAndCourse(slug: string): Promise<ChapterWithRelations | null> {
    if (!slug) return null
    const result = await this._getDb().query.chapters.findFirst({
      where: eq(this.table.slug, slug),
      with: {
        courseRef: {
          with: {
            chapters: {
              orderBy: (chapters, { asc }) => [asc(chapters.order), asc(chapters.id)]
            }
          }
        },
        lessons: {
          orderBy: (lessons, { asc }) => [asc(lessons.order), asc(lessons.id)]
        },
        exercises: {
          limit: 1
        }
      }
    })
    if (!result) return null
    const courseRef = result.courseRef as any
    return {
      ...result,
      courseEntity: result.courseRef || null,
      lessonList: (result as any).lessons || [],
      exerciseEntity: (result as any).exercises?.[0] || null,
      siblingChapters: courseRef?.chapters || []
    } as unknown as ChapterWithRelations
  }
}

export const chapterRepository = new ChapterRepository()
export default chapterRepository
