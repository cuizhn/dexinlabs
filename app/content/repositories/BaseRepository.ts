/**
 * 仓储层基类 - 封装通用 CRUD 操作
 *
 * 提供 list / getBySlug / getById 三个通用方法，
 * 子类只需继承并添加类型收窄覆写和关联查询方法。
 *
 * 设计说明：
 * 基类方法返回 any 类型，子类通过覆写提供精确的返回类型。
 * 这避免了 Drizzle ORM 复杂泛型系统带来的类型约束问题，
 * 同时保持了代码复用的核心目标——消除 ~90 行重复的 CRUD 样板代码。
 */
import { eq, asc } from 'drizzle-orm'
import { getDb, type DbInstance } from '@database'

/**
 * BaseRepository - 仓储层抽象基类
 *
 * 泛型参数 TTable 为 Drizzle 表定义（如 domains、topics 等）。
 * 子类通过覆写 list/getBySlug/getById 提供精确的返回类型。
 *
 * 提供的通用方法：
 * - list(): 按 order+id 升序返回全部记录
 * - getBySlug(slug): 按 slug 精确匹配返回单条记录
 * - findById(id): 按主键匹配返回单条记录
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class BaseRepository<TTable extends Record<string, any>> {
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

  /** 按 order + id 升序返回全部记录（子类需覆写以提供精确类型） */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async list(): Promise<any[]> {
    const t = this.table as any
    return this.getDb().select().from(t)
      .orderBy(asc(t.order), asc(t.id))
  }

  /** 按 slug 精确匹配返回单条记录（子类需覆写以提供精确类型） */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findBySlug(slug: string | undefined | null): Promise<any> {
    if (!slug) return null
    const t = this.table as any
    const rows = await this.getDb().select().from(t)
      .where(eq(t.slug, slug))
      .limit(1)
    return rows[0] || null
  }

  /** 按主键匹配返回单条记录（子类需覆写以提供精确类型） */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findById(id: number | string | undefined | null): Promise<any> {
    if (!id) return null
    const t = this.table as any
    const rows = await this.getDb().select().from(t)
      .where(eq(t.id, Number(id)))
      .limit(1)
    return rows[0] || null
  }
}
