/**
 * ChapterRepository - 章节数据访问层
 * 
 * 设计意图：
 * =========
 * 封装章节表的数据库操作，提供类型安全的 CRUD 接口。
 * 
 * 职责边界：
 * =========
 * 1. 执行数据库查询（SELECT/INSERT/UPDATE/DELETE）
 * 2. 构建 WHERE 条件
 * 3. 返回类型安全的结果
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
import { eq, and, or, asc, desc, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { getDb, chapters, courses, type DbInstance } from '../index'
import type { Chapter } from '../../content-engine/models/index'

/** 章节查询类型别名 */
type SelectChapter = Chapter
/** 章节插入类型别名 */
type InsertChapter = typeof chapters.$inferInsert

/**
 * ChapterFilters - 章节查询过滤条件
 * 
 * 设计意图：
 * =========
 * 定义章节查询的过滤参数，支持按课程、课程 ID、slug 过滤。
 */
export interface ChapterFilters {
  course?: string
  courseId?: number | string
  slug?: string
}

/**
 * ChapterListOptions - 章节列表查询选项
 * 
 * 设计意图：
 * =========
 * 在过滤条件基础上增加排序选项，支持按 id 或 order 排序。
 */
export interface ChapterListOptions extends ChapterFilters {
  orderBy?: 'id' | 'order'
  order?: 'asc' | 'desc'
}

/**
 * ChapterListByCourseRow - 按课程查询章节的返回行
 * 
 * 设计意图：
 * =========
 * 定义 listByCourse 方法的返回类型，包含章节的所有字段。
 */
export interface ChapterListByCourseRow {
  id: SelectChapter['id']
  slug: SelectChapter['slug']
  title: SelectChapter['title']
  summary: SelectChapter['summary']
  order: SelectChapter['order']
  course: SelectChapter['course']
  cover: SelectChapter['cover']
  body: SelectChapter['body']
  courseId: SelectChapter['courseId']
  createdAt: SelectChapter['createdAt']
  updatedAt: SelectChapter['updatedAt']
}

/**
 * ChapterRepository 类 - 章节数据访问层
 * 
 * 使用场景：
 * ========
 * - ChapterService 委托查询数据
 * - Admin 后台（已删除，保留接口）
 * - 其他需要直接访问章节数据的模块
 */
export class ChapterRepository {
  /** 显式传入的数据库实例（用于测试） */
  _explicitDb?: DbInstance | null
  /** 章节表定义 */
  table: typeof chapters

  /**
   * 构造函数 - 支持依赖注入
   * 
   * @param db 数据库实例（可选，用于测试）
   */
  constructor(db?: DbInstance) {
    this._explicitDb = db || null
    this.table = chapters
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
   * _buildWhere - 构建 WHERE 条件
   * 
   * 实现逻辑：
   * ========
   * 根据过滤条件动态构建 SQL WHERE 子句。
   * 
   * @param filters 过滤条件
   * @returns SQL | undefined WHERE 子句
   */
  _buildWhere({ course, courseId, slug }: ChapterFilters = {}): SQL | undefined {
    const clauses: SQL[] = []
    if (slug) clauses.push(eq(this.table.slug, slug))
    if (courseId) clauses.push(eq(this.table.courseId, Number(courseId)))
    if (course) clauses.push(eq(this.table.course, course))
    return clauses.length ? and(...clauses) : undefined
  }

  /**
   * list - 获取章节列表
   * 
   * 实现逻辑：
   * ========
   * 1. 根据 orderBy 和 order 参数确定排序方式
   * 2. 根据过滤条件构建 WHERE 子句
   * 3. 执行查询并返回结果
   * 
   * @param options 查询选项
   * @returns Promise<SelectChapter[]> 章节列表
   */
  async list({ course, courseId, orderBy = 'order', order = 'asc' }: ChapterListOptions = {}): Promise<SelectChapter[]> {
    const sortDir = order.toLowerCase() === 'desc' ? desc : asc
    const sortCol = orderBy === 'id' ? this.table.id : this.table.order
    const where = this._buildWhere({ course, courseId })
    let query: any = this._getDb().select().from(this.table)
    if (where) query = query.where(where)
    return query.orderBy(sortDir(sortCol))
  }

  /**
   * listByCourse - 根据课程 slug 获取章节列表
   * 
   * 实现逻辑：
   * ========
   * 1. 使用 LEFT JOIN 关联 courses 表
   * 2. 使用 OR 条件同时匹配章节的 course 字段和课程的 slug 字段
   * 3. 按 order 和 id 升序排列
   * 
   * 为什么需要 LEFT JOIN？
   * ====================
   * 章节可能通过 courseId（外键）或 course（slug）关联课程，
   * 需要同时支持两种方式的查询。
   * 
   * @param courseSlug 课程的唯一标识
   * @returns Promise<ChapterListByCourseRow[]> 章节列表
   */
  async listByCourse(courseSlug: string | undefined | null): Promise<ChapterListByCourseRow[]> {
    if (!courseSlug) return []
    const rows = await this._getDb()
      .select({
        id: this.table.id,
        slug: this.table.slug,
        title: this.table.title,
        summary: this.table.summary,
        order: this.table.order,
        course: this.table.course,
        cover: this.table.cover,
        body: this.table.body,
        courseId: this.table.courseId,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt
      })
      .from(this.table)
      .leftJoin(courses, eq(this.table.courseId, courses.id))
      .where(
        or(
          eq(this.table.course, courseSlug),
          eq(courses.slug, courseSlug)
        )
      )
      .orderBy(asc(this.table.order), asc(this.table.id))
    return rows
  }

  /**
   * getBySlug - 根据 slug 获取章节
   * 
   * @param slug 章节的唯一标识
   * @returns Promise<SelectChapter | null> 章节对象或 null
   */
  async getBySlug(slug: string | undefined | null): Promise<SelectChapter | null> {
    if (!slug) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.slug, slug))
      .limit(1)
    return rows[0] || null
  }

  /**
   * getById - 根据 ID 获取章节
   * 
   * @param id 章节的数字 ID
   * @returns Promise<SelectChapter | null> 章节对象或 null
   */
  async getById(id: number | string | undefined | null): Promise<SelectChapter | null> {
    if (!id) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.id, Number(id)))
      .limit(1)
    return rows[0] || null
  }

  /**
   * count - 统计章节数量
   * 
   * @param filters 过滤条件
   * @returns Promise<number> 章节数量
   */
  async count(filters: ChapterFilters = {}): Promise<number> {
    const where = this._buildWhere(filters)
    let query: any = this._getDb().select({ count: sql<number>`count(*)`.mapWith(Number) }).from(this.table)
    if (where) query = query.where(where)
    const rows = await query
    return Number(rows[0]?.count ?? 0)
  }

  /**
   * create - 创建章节
   * 
   * @param data 章节数据
   * @returns Promise<SelectChapter | null> 创建的章节对象
   */
  async create(data: InsertChapter): Promise<SelectChapter | null> {
    const rows = await this._getDb().insert(this.table).values(data).returning()
    return rows[0] || null
  }

  /**
   * updateBySlug - 根据 slug 更新章节
   * 
   * 实现逻辑：
   * ========
   * 1. 自动设置 updatedAt 为当前时间
   * 2. 禁止更新 id、slug、createdAt 字段
   * 3. 执行更新并返回更新后的记录
   * 
   * @param slug 章节的唯一标识
   * @param data 更新数据
   * @returns Promise<SelectChapter | null> 更新后的章节对象
   */
  async updateBySlug(slug: string, data: Partial<Omit<InsertChapter, 'id' | 'slug' | 'createdAt'>>): Promise<SelectChapter | null> {
    const patch: Partial<InsertChapter> = { ...data, updatedAt: new Date() }
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
   * upsert - 插入或更新章节
   * 
   * 实现逻辑：
   * ========
   * 1. 使用 ON CONFLICT DO UPDATE 实现 upsert
   * 2. 冲突条件为 slug 唯一索引
   * 3. 冲突时更新除 slug 外的所有字段，并设置 updatedAt
   * 
   * @param data 章节数据
   * @returns Promise<SelectChapter | null> 插入或更新后的章节对象
   */
  async upsert(data: InsertChapter): Promise<SelectChapter | null> {
    const { id, createdAt, ...rest } = data || ({} as InsertChapter)
    const payload: Omit<InsertChapter, 'id' | 'createdAt'> = { ...rest }
    const onConflictSet: Partial<InsertChapter> = { ...rest }
    delete (onConflictSet as { slug?: unknown }).slug
    onConflictSet.updatedAt = new Date()
    const rows = await this._getDb()
      .insert(this.table)
      .values(payload as InsertChapter)
      .onConflictDoUpdate({
        target: this.table.slug,
        set: onConflictSet
      })
      .returning()
    return rows[0] || null
  }

  /**
   * deleteBySlug - 根据 slug 删除章节
   * 
   * @param slug 章节的唯一标识
   * @returns Promise<{ rowCount: number | null }> 删除结果
   */
  async deleteBySlug(slug: string): Promise<{ rowCount: number | null }> {
    return this._getDb().delete(this.table).where(eq(this.table.slug, slug))
  }
}

/**
 * ChapterRepository 单例实例
 * 
 * 使用方式：
 * ========
 * import { chapterRepository } from '@core/database/repositories'
 * const chapters = await chapterRepository.list()
 */
export const chapterRepository = new ChapterRepository()
export default chapterRepository
