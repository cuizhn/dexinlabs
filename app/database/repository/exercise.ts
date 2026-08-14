/**
 * 练习仓储 - exercises 表的 CRUD 操作
 *
 * 继承 BaseRepository 获得 findBySlug / findById 通用方法，
 * 自身覆写 list() 以支持过滤和排序参数，并定义业务方法。
 *
 * 架构 V4：Exercise 通过 topicId 关联 Topic
 */
import { eq, and, asc, desc } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { exercises } from '@database'
import type { Exercise } from '../types'
import type { CommonColumns } from './BaseRepository'
import { BaseRepository } from './BaseRepository'

export interface ExerciseFilters {
  topicId?: number
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
  private buildWhere({ topicId, slug }: ExerciseFilters = {}): SQL | undefined {
    const clauses: SQL[] = []
    if (slug) clauses.push(eq(this.table.slug, slug))
    if (topicId) clauses.push(eq(this.table.topicId, topicId))
    return clauses.length ? and(...clauses) : undefined
  }

  /**
   * 带过滤和排序的列表查询
   */
  override async list({ topicId, orderBy = 'order', order = 'asc' }: ExerciseListOptions = {}): Promise<Exercise[]> {
    const sortDir = order.toLowerCase() === 'desc' ? desc : asc
    const cols = this.table as unknown as CommonColumns
    const sortCol = orderBy === 'id' ? cols.id : cols.order
    const where = this.buildWhere({ topicId })
    const baseQuery = this.getDb().select().from(this.table as never)
    const filteredQuery = where ? baseQuery.where(where) : baseQuery
    return await filteredQuery.orderBy(sortDir(sortCol as never)) as Exercise[]
  }

  /** 按知识主题 slug 过滤练习列表（先查 topicId，再过滤） */
  async listByTopic(topicSlug: string | undefined | null): Promise<Exercise[]> {
    if (!topicSlug) return []
    const db = this.getDb()
    const topicRow = await db.query.topics.findFirst({
      where: (topics, { eq }) => eq(topics.slug, topicSlug)
    })
    if (!topicRow) return []
    return db.select().from(this.table)
      .where(eq(this.table.topicId, topicRow.id))
      .orderBy(asc(this.table.order), asc(this.table.id)) as unknown as Exercise[]
  }

  // ── 以下为通用方法的类型收窄覆写 ──

  override async findById(id: number | string | undefined | null): Promise<Exercise | null> {
    return await super.findById(id) as Exercise | null
  }
}

export const exerciseRepository = new ExerciseRepository()
export default exerciseRepository
