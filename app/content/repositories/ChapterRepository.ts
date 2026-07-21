/**
 * 章节仓储 - 章节表的 CRUD 操作，含关联查询（课时、课程、练习）
 */
import { eq, asc } from 'drizzle-orm'
import { getDb, chapters, type DbInstance } from '@database'
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
    return this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.course, courseSlug))
      .orderBy(asc(this.table.order), asc(this.table.id))
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
    /**
     * Drizzle 关系查询返回的字段名与 ChapterWithRelations 接口不一致，
     * 需要手动映射：lessons -> lessonList, exercises[0] -> exerciseEntity,
     * courseRef -> courseEntity, courseRef.chapters -> siblingChapters
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Drizzle 关系查询返回类型不含显式字段名
    const courseRef = result.courseRef as any
    return {
      ...result,
      courseEntity: result.courseRef || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Drizzle with 查询字段名与接口定义不一致
      lessonList: (result as any).lessons || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 同上，exercises 为 Drizzle 关系查询动态字段
      exerciseEntity: (result as any).exercises?.[0] || null,
      siblingChapters: courseRef?.chapters || []
    } as unknown as ChapterWithRelations
  }
}

export const chapterRepository = new ChapterRepository()
export default chapterRepository
