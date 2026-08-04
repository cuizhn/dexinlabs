/**
 * 练习仓储 - 练习表的 CRUD 操作，支持多条件过滤和排序
 *
 * 继承 BaseRepository 获得 findBySlug / findById 通用方法，
 * 自身覆写 list() 以支持过滤和排序参数，并定义业务方法。
 */
import { eq, and, asc, desc } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { exercises } from '@database'
import type { Exercise } from '@content/types/index'
import type { CommonColumns } from './BaseRepository'
import { BaseRepository } from './BaseRepository'

export interface ExerciseFilters {
  topic?: string
  topicId?: number | string
  slug?: string
}

export interface ExerciseListOptions extends ExerciseFilters {
  orderBy?: 'id' | 'order'
  order?: 'asc' | 'desc'
}

export class ExerciseRepository extends BaseRepository<typeof exercises> {
  constructor() {
    super(exercises)
  }

  /** 构建多条件 WHERE 子句 */
  private buildWhere({ topic, topicId, slug }: ExerciseFilters = {}): SQL | undefined {
    const clauses: SQL[] = []
    if (slug) clauses.push(eq(this.table.slug, slug))
    if (topicId) clauses.push(eq(this.table.topicId, Number(topicId)))
    if (topic) clauses.push(eq(this.table.topic, topic))
    return clauses.length ? and(...clauses) : undefined
  }

  /**
   * 带过滤和排序的列表查询
   *
   * 覆写基类的 list()，支持按主题、slug 过滤及自定义排序。
   */
  override async list({ topic, topicId, orderBy = 'order', order = 'asc' }: ExerciseListOptions = {}): Promise<Exercise[]> {
    const sortDir = order.toLowerCase() === 'desc' ? desc : asc
    const cols = this.table as unknown as CommonColumns
    const sortCol = orderBy === 'id' ? cols.id : cols.order
    const where = this.buildWhere({ topic, topicId })
    const baseQuery = this.getDb().select().from(this.table as never)
    const filteredQuery = where ? baseQuery.where(where) : baseQuery
    return filteredQuery.orderBy(sortDir(sortCol as never)) as Promise<Exercise[]>
  }

  /** 按知识主题 slug 过滤练习列表 */
  async listByTopic(topicSlug: string | undefined | null): Promise<Exercise[]> {
    if (!topicSlug) return []
    return this.getDb().select().from(this.table)
      .where(eq(this.table.topic, topicSlug))
      .orderBy(asc(this.table.order), asc(this.table.id)) as Promise<Exercise[]>
  }

  // ── 以下为通用方法的类型收窄覆写 ──

  override async findById(id: number | string | undefined | null): Promise<Exercise | null> {
    return super.findById(id) as Promise<Exercise | null>
  }
}

export const exerciseRepository = new ExerciseRepository()
export default exerciseRepository
