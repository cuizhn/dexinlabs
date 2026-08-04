/**
 * 仓储层基类 - 封装通用 CRUD 操作
 *
 * 提供 list / findBySlug / findById 三个通用方法，
 * 子类只需继承并添加类型收窄覆写和关联查询方法。
 *
 * 设计说明：
 * - 泛型约束使用 Drizzle 的 PgTable，兼容所有表定义
 * - 列访问通过 CommonColumns 接口（as unknown as），保证类型边界
 * - Drizzle API 调用点使用 as never 突破条件类型约束（不使用 as any）
 * - 返回类型为 unknown，子类通过覆写提供精确类型
 */
import { eq, asc } from 'drizzle-orm'
import type { PgTable } from 'drizzle-orm/pg-core'
import { getDb, type DbInstance } from '@database'

/**
 * CommonColumns - 所有表共有的列结构
 *
 * 项目中每张表都包含 id、slug、order 三列，
 * 基类通过此接口访问公共列，避免 as any。
 */
export interface CommonColumns {
  id: unknown
  slug: unknown
  order: unknown
}

/**
 * BaseRepository - 仓储层抽象基类
 *
 * 泛型参数 TTable 为 Drizzle 表定义（如 domains、topics 等）。
 * 子类通过覆写 list/findBySlug/findById 提供精确的返回类型。
 *
 * 提供的通用方法：
 * - list(): 按 order+id 升序返回全部记录
 * - findBySlug(slug): 按 slug 精确匹配返回单条记录
 * - findById(id): 按主键匹配返回单条记录
 */
export abstract class BaseRepository<TTable extends PgTable> {
  protected _explicitDb: DbInstance | null = null
  protected table: TTable

  constructor(table: TTable, db?: DbInstance) {
    this.table = table
    this._explicitDb = db || null
  }

  /** 获取数据库实例：优先使用构造时注入的实例，否则取全局单例 */
  protected getDb(): DbInstance {
    return (this._explicitDb || getDb()) as DbInstance
  }

  /** 将 table 转为 CommonColumns 以安全访问公共列 */
  private get cols(): CommonColumns {
    return this.table as unknown as CommonColumns
  }

  /** 按 order + id 升序返回全部记录（子类需覆写以提供精确类型） */
  async list(): Promise<unknown[]> {
    // Drizzle .from() 使用条件类型，泛型 TTable 无法满足，用 as never 突破约束
    return this.getDb().select().from(this.table as never)
      .orderBy(asc(this.cols.order as never), asc(this.cols.id as never))
  }

  /** 按 slug 精确匹配返回单条记录（子类需覆写以提供精确类型） */
  async findBySlug(slug: string | undefined | null): Promise<unknown> {
    if (!slug) return null
    const rows = await this.getDb().select().from(this.table as never)
      .where(eq(this.cols.slug as never, slug))
      .limit(1)
    return rows[0] || null
  }

  /** 按主键匹配返回单条记录（子类需覆写以提供精确类型） */
  async findById(id: number | string | undefined | null): Promise<unknown> {
    if (!id) return null
    const rows = await this.getDb().select().from(this.table as never)
      .where(eq(this.cols.id as never, Number(id)))
      .limit(1)
    return rows[0] || null
  }
}
