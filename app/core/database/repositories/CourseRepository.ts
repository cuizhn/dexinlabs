/**
 * CourseRepository - 课程数据访问层
 * 
 * 设计意图：
 * =========
 * 封装课程表的数据库操作，提供类型安全的 CRUD 接口。
 * 
 * 职责边界：
 * =========
 * 1. 执行数据库查询（SELECT/INSERT/UPDATE/DELETE）
 * 2. 返回类型安全的结果
 * 3. 提供默认课程查询逻辑
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
import { getDb, courses, type DbInstance } from '../index'
import type { Course } from '../../content-engine/models/index'

/** 课程查询类型别名 */
type SelectCourse = Course
/** 课程插入类型别名 */
type InsertCourse = typeof courses.$inferInsert

/**
 * CourseListOptions - 课程列表查询选项
 * 
 * 设计意图：
 * =========
 * 定义课程列表查询的排序选项，支持按 id 或 order 排序。
 */
export interface CourseListOptions {
  orderBy?: 'id' | 'order'
  order?: 'asc' | 'desc'
}

/**
 * CourseRepository 类 - 课程数据访问层
 * 
 * 使用场景：
 * ========
 * - CourseService 委托查询数据
 * - Admin 后台（已删除，保留接口）
 * - 其他需要直接访问课程数据的模块
 */
export class CourseRepository {
  /** 显式传入的数据库实例（用于测试） */
  _explicitDb?: DbInstance | null
  /** 课程表定义 */
  table: typeof courses

  /**
   * 构造函数 - 支持依赖注入
   * 
   * @param db 数据库实例（可选，用于测试）
   */
  constructor(db?: DbInstance) {
    this._explicitDb = db || null
    this.table = courses
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
   * list - 获取课程列表
   * 
   * 实现逻辑：
   * ========
   * 1. 根据 orderBy 和 order 参数确定排序方式
   * 2. 执行查询并返回结果
   * 
   * @param options 查询选项
   * @returns Promise<SelectCourse[]> 课程列表
   */
  async list({ orderBy = 'order', order = 'asc' }: CourseListOptions = {}): Promise<SelectCourse[]> {
    const sortDir = order.toLowerCase() === 'desc' ? desc : asc
    const sortCol = orderBy === 'id' ? this.table.id : this.table.order
    return this._getDb().select().from(this.table).orderBy(sortDir(sortCol))
  }

  /**
   * getBySlug - 根据 slug 获取课程
   * 
   * @param slug 课程的唯一标识
   * @returns Promise<SelectCourse | null> 课程对象或 null
   */
  async getBySlug(slug: string | undefined | null): Promise<SelectCourse | null> {
    if (!slug) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.slug, slug))
      .limit(1)
    return rows[0] || null
  }

  /**
   * getById - 根据 ID 获取课程
   * 
   * @param id 课程的数字 ID
   * @returns Promise<SelectCourse | null> 课程对象或 null
   */
  async getById(id: number | string | undefined | null): Promise<SelectCourse | null> {
    if (!id) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.id, Number(id)))
      .limit(1)
    return rows[0] || null
  }

  /**
   * getDefault - 获取默认课程
   * 
   * 实现逻辑：
   * ========
   * 1. 首先尝试获取 slug 为 'pep-7a' 的课程（硬编码的默认课程）
   * 2. 如果不存在，获取排序第一的课程作为默认课程
   * 
   * 为什么这样设计？
   * ==============
   * 1. **兼容性**：保留原有系统的默认课程逻辑
   * 2. **灵活性**：如果默认课程不存在，自动降级到第一个课程
   * 3. **可配置性**：可以通过修改 slug 值来更改默认课程
   * 
   * @returns Promise<SelectCourse | null> 默认课程对象或 null
   */
  async getDefault(): Promise<SelectCourse | null> {
    let row = await this.getBySlug('pep-7a')
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

  /**
   * count - 统计课程数量
   * 
   * @returns Promise<number> 课程数量
   */
  async count(): Promise<number> {
    const rows = await this._getDb().select({
      count: sql<number>`count(*)`.mapWith(Number)
    }).from(this.table)
    return Number(rows[0]?.count ?? 0)
  }

  /**
   * create - 创建课程
   * 
   * @param data 课程数据
   * @returns Promise<SelectCourse | null> 创建的课程对象
   */
  async create(data: InsertCourse): Promise<SelectCourse | null> {
    const rows = await this._getDb().insert(this.table).values(data).returning()
    return rows[0] || null
  }

  /**
   * updateBySlug - 根据 slug 更新课程
   * 
   * 实现逻辑：
   * ========
   * 1. 自动设置 updatedAt 为当前时间
   * 2. 禁止更新 id、slug、createdAt 字段
   * 3. 执行更新并返回更新后的记录
   * 
   * @param slug 课程的唯一标识
   * @param data 更新数据
   * @returns Promise<SelectCourse | null> 更新后的课程对象
   */
  async updateBySlug(slug: string, data: Partial<Omit<InsertCourse, 'id' | 'slug' | 'createdAt'>>): Promise<SelectCourse | null> {
    const patch: Partial<InsertCourse> = { ...data, updatedAt: new Date() }
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
   * upsert - 插入或更新课程
   * 
   * 实现逻辑：
   * ========
   * 1. 使用 ON CONFLICT DO UPDATE 实现 upsert
   * 2. 冲突条件为 slug 唯一索引
   * 3. 冲突时更新除 slug 外的所有字段，并设置 updatedAt
   * 
   * @param data 课程数据
   * @returns Promise<SelectCourse | null> 插入或更新后的课程对象
   */
  async upsert(data: InsertCourse): Promise<SelectCourse | null> {
    const { id, createdAt, ...rest } = data || ({} as InsertCourse)
    const payload: Omit<InsertCourse, 'id' | 'createdAt'> = { ...rest }
    const onConflictSet: Partial<InsertCourse> = { ...rest }
    delete (onConflictSet as { slug?: unknown }).slug
    onConflictSet.updatedAt = new Date()
    const rows = await this._getDb()
      .insert(this.table)
      .values(payload as InsertCourse)
      .onConflictDoUpdate({
        target: this.table.slug,
        set: onConflictSet
      })
      .returning()
    return rows[0] || null
  }

  /**
   * deleteBySlug - 根据 slug 删除课程
   * 
   * @param slug 课程的唯一标识
   * @returns Promise<{ rowCount: number | null }> 删除结果
   */
  async deleteBySlug(slug: string): Promise<{ rowCount: number | null }> {
    return this._getDb().delete(this.table).where(eq(this.table.slug, slug))
  }
}

/**
 * CourseRepository 单例实例
 * 
 * 使用方式：
 * ========
 * import { courseRepository } from '@core/database/repositories'
 * const courses = await courseRepository.list()
 */
export const courseRepository = new CourseRepository()
export default courseRepository
