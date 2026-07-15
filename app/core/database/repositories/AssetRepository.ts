/**
 * AssetRepository - 资源数据访问层
 * 
 * 设计意图：
 * =========
 * 封装资源表的数据库操作，提供类型安全的 CRUD 接口。
 * 
 * 职责边界：
 * =========
 * 1. 执行数据库查询（SELECT/INSERT/UPDATE/DELETE）
 * 2. 返回类型安全的结果
 * 3. 支持按类型过滤
 * 
 * 为什么需要 Repository 层？
 * =======================
 * 1. **数据访问封装**：将 SQL 查询逻辑集中在一处
 * 2. **类型安全**：使用 TypeScript 类型系统确保返回值类型正确
 * 3. **可测试性**：通过依赖注入便于 Mock
 * 4. **代码复用**：相同的查询逻辑只写一次
 * 
 * 替代方案对比：
 * =============
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | **Repository 模式** | 数据访问集中，类型安全 | 增加一层抽象 |
 * | 直接使用 db 查询 | 简单直接 | 代码重复，难以维护 |
 * | Active Record | 直观，易于使用 | 耦合度高，难以测试 |
 * 
 * 本方案优势：
 * ===========
 * - **单一职责**：只负责数据访问，不包含业务逻辑
 * - **类型安全**：所有查询都有完整的类型支持
 * - **可测试性**：支持依赖注入，便于单元测试
 * - **灵活性**：支持显式传入数据库实例，便于测试
 */
import { eq, asc, desc, sql } from 'drizzle-orm'
import { getDb, assets, type DbInstance } from '../index'
import type { Asset } from '../../content-engine/models/index'

/** 资源查询类型别名 */
type SelectAsset = Asset
/** 资源插入类型别名 */
type InsertAsset = typeof assets.$inferInsert

/**
 * AssetListOptions - 资源列表查询选项
 * 
 * 设计意图：
 * =========
 * 定义资源列表查询的过滤和排序选项。
 */
export interface AssetListOptions {
  type?: string
  orderBy?: keyof SelectAsset
  order?: 'asc' | 'desc'
}

/**
 * AssetRepository 类 - 资源数据访问层
 * 
 * 使用场景：
 * ========
 * - 管理上传的图片、PDF、视频等资源文件
 * - Admin 后台（已删除，保留接口）
 * - 其他需要直接访问资源数据的模块
 */
export class AssetRepository {
  /** 显式传入的数据库实例（用于测试） */
  _explicitDb?: DbInstance | null
  /** 资源表定义 */
  table: typeof assets

  /**
   * 构造函数 - 支持依赖注入
   * 
   * @param db 数据库实例（可选，用于测试）
   */
  constructor(db?: DbInstance) {
    this._explicitDb = db || null
    this.table = assets
  }

  /**
   * _getDb - 获取数据库实例
   * 
   * 实现逻辑：
   * ========
   * 如果有显式传入的数据库实例则使用，否则使用全局单例。
   * 
   * @returns DbInstance 数据库实例
   */
  _getDb(): DbInstance {
    return (this._explicitDb || getDb()) as DbInstance
  }

  /**
   * list - 获取资源列表
   * 
   * 实现逻辑：
   * ========
   * 1. 根据 orderBy 和 order 参数确定排序方式
   * 2. 如果提供 type，添加类型过滤条件
   * 3. 执行查询并返回结果
   * 
   * @param options 查询选项
   * @returns Promise<SelectAsset[]> 资源列表
   */
  async list({ type, orderBy = 'id', order = 'asc' }: AssetListOptions = {}): Promise<SelectAsset[]> {
    const sortDir = order.toLowerCase() === 'desc' ? desc : asc
    let query: any = this._getDb().select().from(this.table)
    if (type) query = query.where(eq(this.table.type, type))
    const sortColumn = (this.table[orderBy] || this.table.id)
    return query.orderBy(sortDir(sortColumn))
  }

  /**
   * getBySlug - 根据 slug 获取资源
   * 
   * @param slug 资源的唯一标识
   * @returns Promise<SelectAsset | null> 资源对象或 null
   */
  async getBySlug(slug: string | undefined | null): Promise<SelectAsset | null> {
    if (!slug) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.slug, slug))
      .limit(1)
    return rows[0] || null
  }

  /**
   * getById - 根据 ID 获取资源
   * 
   * @param id 资源的数字 ID
   * @returns Promise<SelectAsset | null> 资源对象或 null
   */
  async getById(id: number | string | undefined | null): Promise<SelectAsset | null> {
    if (!id) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.id, Number(id)))
      .limit(1)
    return rows[0] || null
  }

  /**
   * count - 统计资源数量
   * 
   * @returns Promise<number> 资源数量
   */
  async count(): Promise<number> {
    const rows = await this._getDb().select({
      count: sql<number>`count(*)`.mapWith(Number)
    }).from(this.table)
    return Number(rows[0]?.count ?? 0)
  }

  /**
   * create - 创建资源
   * 
   * @param data 资源数据
   * @returns Promise<SelectAsset | null> 创建的资源对象
   */
  async create(data: InsertAsset): Promise<SelectAsset | null> {
    const rows = await this._getDb().insert(this.table).values(data).returning()
    return rows[0] || null
  }

  /**
   * updateBySlug - 根据 slug 更新资源
   * 
   * 实现逻辑：
   * ========
   * 1. 自动设置 updatedAt 为当前时间
   * 2. 禁止更新 id、slug、createdAt 字段
   * 3. 执行更新并返回更新后的记录
   * 
   * @param slug 资源的唯一标识
   * @param data 更新数据
   * @returns Promise<SelectAsset | null> 更新后的资源对象
   */
  async updateBySlug(slug: string, data: Partial<Omit<InsertAsset, 'id' | 'slug' | 'createdAt'>>): Promise<SelectAsset | null> {
    const patch: Partial<InsertAsset> = { ...data, updatedAt: new Date() }
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

  /**
   * upsert - 插入或更新资源
   * 
   * 实现逻辑：
   * ========
   * 1. 使用 ON CONFLICT DO UPDATE 实现 upsert
   * 2. 冲突条件为 slug 唯一索引
   * 3. 冲突时更新除 slug 外的所有字段，并设置 updatedAt
   * 
   * @param data 资源数据
   * @returns Promise<SelectAsset | null> 插入或更新后的资源对象
   */
  async upsert(data: InsertAsset): Promise<SelectAsset | null> {
    const { id, createdAt, ...rest } = data || ({} as InsertAsset)
    const payload: Omit<InsertAsset, 'id' | 'createdAt'> = { ...rest }
    const onConflictSet: Partial<InsertAsset> = { ...rest }
    delete (onConflictSet as { slug?: unknown }).slug
    onConflictSet.updatedAt = new Date()
    const rows = await this._getDb()
      .insert(this.table)
      .values(payload as InsertAsset)
      .onConflictDoUpdate({
        target: this.table.slug,
        set: onConflictSet
      })
      .returning()
    return rows[0] || null
  }

  /**
   * deleteBySlug - 根据 slug 删除资源
   * 
   * @param slug 资源的唯一标识
   * @returns Promise<{ rowCount: number | null }> 删除结果
   */
  async deleteBySlug(slug: string): Promise<{ rowCount: number | null }> {
    return this._getDb().delete(this.table).where(eq(this.table.slug, slug))
  }
}

/**
 * AssetRepository 单例实例
 * 
 * 使用方式：
 * ========
 * import { assetRepository } from '@core/database/repositories'
 * const assets = await assetRepository.list()
 */
export const assetRepository = new AssetRepository()
export default assetRepository
