/**
 * LessonRepository - 课时数据访问层
 * 
 * 设计意图：
 * =========
 * 封装课时表的数据库操作，提供类型安全的 CRUD 接口。
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
import { getDb, lessons, chapters, type DbInstance } from '../index'
import type { Lesson } from '../../content-engine/models/index'

/** 课时查询类型别名 */
type SelectLesson = Lesson
/** 课时插入类型别名 */
type InsertLesson = typeof lessons.$inferInsert

/**
 * LessonFilters - 课时查询过滤条件
 * 
 * 设计意图：
 * =========
 * 定义课时查询的过滤参数，支持按章节、章节 ID、slug 过滤。
 */
export interface LessonFilters {
  chapter?: string
  chapterId?: number | string
  slug?: string
}

/**
 * LessonListOptions - 课时列表查询选项
 * 
 * 设计意图：
 * =========
 * 在过滤条件基础上增加排序选项，支持按 id 或 order 排序。
 */
export interface LessonListOptions extends LessonFilters {
  orderBy?: 'id' | 'order'
  order?: 'asc' | 'desc'
}

/**
 * LessonListByChapterRow - 按章节查询课时的返回行
 * 
 * 设计意图：
 * =========
 * 定义 listByChapter 方法的返回类型，包含课时的所有字段。
 */
export interface LessonListByChapterRow {
  id: SelectLesson['id']
  slug: SelectLesson['slug']
  title: SelectLesson['title']
  summary: SelectLesson['summary']
  order: SelectLesson['order']
  chapter: SelectLesson['chapter']
  objectives: SelectLesson['objectives']
  intro: SelectLesson['intro']
  body: SelectLesson['body']
  summaryText: SelectLesson['summaryText']
  notes: SelectLesson['notes']
  chapterId: SelectLesson['chapterId']
  createdAt: SelectLesson['createdAt']
  updatedAt: SelectLesson['updatedAt']
}

/**
 * LessonRepository 类 - 课时数据访问层
 * 
 * 使用场景：
 * ========
 * - LessonService 委托查询数据
 * - Admin 后台（已删除，保留接口）
 * - 其他需要直接访问课时数据的模块
 */
export class LessonRepository {
  /** 显式传入的数据库实例（用于测试） */
  _explicitDb?: DbInstance | null
  /** 课时表定义 */
  table: typeof lessons

  /**
   * 构造函数 - 支持依赖注入
   * 
   * @param db 数据库实例（可选，用于测试）
   */
  constructor(db?: DbInstance) {
    this._explicitDb = db || null
    this.table = lessons
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
  _buildWhere({ chapter, chapterId, slug }: LessonFilters = {}): SQL | undefined {
    const clauses: SQL[] = []
    if (slug) clauses.push(eq(this.table.slug, slug))
    if (chapterId) clauses.push(eq(this.table.chapterId, Number(chapterId)))
    if (chapter) clauses.push(eq(this.table.chapter, chapter))
    return clauses.length ? and(...clauses) : undefined
  }

  /**
   * list - 获取课时列表
   * 
   * 实现逻辑：
   * ========
   * 1. 根据 orderBy 和 order 参数确定排序方式
   * 2. 根据过滤条件构建 WHERE 子句
   * 3. 执行查询并返回结果
   * 
   * @param options 查询选项
   * @returns Promise<SelectLesson[]> 课时列表
   */
  async list({ chapter, chapterId, orderBy = 'order', order = 'asc' }: LessonListOptions = {}): Promise<SelectLesson[]> {
    const sortDir = order.toLowerCase() === 'desc' ? desc : asc
    const sortCol = orderBy === 'id' ? this.table.id : this.table.order
    const where = this._buildWhere({ chapter, chapterId })
    let query: any = this._getDb().select().from(this.table)
    if (where) query = query.where(where)
    return query.orderBy(sortDir(sortCol))
  }

  /**
   * listByChapter - 根据章节 slug 获取课时列表
   * 
   * 实现逻辑：
   * ========
   * 1. 使用 LEFT JOIN 关联 chapters 表
   * 2. 使用 OR 条件同时匹配课时的 chapter 字段和章节的 slug 字段
   * 3. 按 order 和 id 升序排列
   * 
   * 为什么需要 LEFT JOIN？
   * ====================
   * 课时可能通过 chapterId（外键）或 chapter（slug）关联章节，
   * 需要同时支持两种方式的查询。
   * 
   * @param chapterSlug 章节的唯一标识
   * @returns Promise<LessonListByChapterRow[]> 课时列表
   */
  async listByChapter(chapterSlug: string | undefined | null): Promise<LessonListByChapterRow[]> {
    if (!chapterSlug) return []
    const rows = await this._getDb()
      .select({
        id: this.table.id,
        slug: this.table.slug,
        title: this.table.title,
        summary: this.table.summary,
        order: this.table.order,
        chapter: this.table.chapter,
        objectives: this.table.objectives,
        intro: this.table.intro,
        body: this.table.body,
        summaryText: this.table.summaryText,
        notes: this.table.notes,
        chapterId: this.table.chapterId,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt
      })
      .from(this.table)
      .leftJoin(chapters, eq(this.table.chapterId, chapters.id))
      .where(
        or(
          eq(this.table.chapter, chapterSlug),
          eq(chapters.slug, chapterSlug)
        )
      )
      .orderBy(asc(this.table.order), asc(this.table.id))
    return rows
  }

  /**
   * getBySlug - 根据 slug 获取课时
   * 
   * @param slug 课时的唯一标识
   * @returns Promise<SelectLesson | null> 课时对象或 null
   */
  async getBySlug(slug: string | undefined | null): Promise<SelectLesson | null> {
    if (!slug) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.slug, slug))
      .limit(1)
    return rows[0] || null
  }

  /**
   * getById - 根据 ID 获取课时
   * 
   * @param id 课时的数字 ID
   * @returns Promise<SelectLesson | null> 课时对象或 null
   */
  async getById(id: number | string | undefined | null): Promise<SelectLesson | null> {
    if (!id) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.id, Number(id)))
      .limit(1)
    return rows[0] || null
  }

  /**
   * count - 统计课时数量
   * 
   * @param filters 过滤条件
   * @returns Promise<number> 课时数量
   */
  async count(filters: LessonFilters = {}): Promise<number> {
    const where = this._buildWhere(filters)
    let query: any = this._getDb().select({ count: sql<number>`count(*)`.mapWith(Number) }).from(this.table)
    if (where) query = query.where(where)
    const rows = await query
    return Number(rows[0]?.count ?? 0)
  }

  /**
   * create - 创建课时
   * 
   * @param data 课时数据
   * @returns Promise<SelectLesson | null> 创建的课时对象
   */
  async create(data: InsertLesson): Promise<SelectLesson | null> {
    const rows = await this._getDb().insert(this.table).values(data).returning()
    return rows[0] || null
  }

  /**
   * updateBySlug - 根据 slug 更新课时
   * 
   * 实现逻辑：
   * ========
   * 1. 自动设置 updatedAt 为当前时间
   * 2. 禁止更新 id、slug、createdAt 字段
   * 3. 执行更新并返回更新后的记录
   * 
   * @param slug 课时的唯一标识
   * @param data 更新数据
   * @returns Promise<SelectLesson | null> 更新后的课时对象
   */
  async updateBySlug(slug: string, data: Partial<Omit<InsertLesson, 'id' | 'slug' | 'createdAt'>>): Promise<SelectLesson | null> {
    const patch: Partial<InsertLesson> = { ...data, updatedAt: new Date() }
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
   * upsert - 插入或更新课时
   * 
   * 实现逻辑：
   * ========
   * 1. 使用 ON CONFLICT DO UPDATE 实现 upsert
   * 2. 冲突条件为 slug 唯一索引
   * 3. 冲突时更新除 slug 外的所有字段，并设置 updatedAt
   * 
   * @param data 课时数据
   * @returns Promise<SelectLesson | null> 插入或更新后的课时对象
   */
  async upsert(data: InsertLesson): Promise<SelectLesson | null> {
    const { id, createdAt, ...rest } = data || ({} as InsertLesson)
    const payload: Omit<InsertLesson, 'id' | 'createdAt'> = { ...rest }
    const onConflictSet: Partial<InsertLesson> = { ...rest }
    delete (onConflictSet as { slug?: unknown }).slug
    onConflictSet.updatedAt = new Date()
    const rows = await this._getDb()
      .insert(this.table)
      .values(payload as InsertLesson)
      .onConflictDoUpdate({
        target: this.table.slug,
        set: onConflictSet
      })
      .returning()
    return rows[0] || null
  }

  /**
   * deleteBySlug - 根据 slug 删除课时
   * 
   * @param slug 课时的唯一标识
   * @returns Promise<{ rowCount: number | null }> 删除结果
   */
  async deleteBySlug(slug: string): Promise<{ rowCount: number | null }> {
    return this._getDb().delete(this.table).where(eq(this.table.slug, slug))
  }
}

/**
 * LessonRepository 单例实例
 * 
 * 使用方式：
 * ========
 * import { lessonRepository } from '@core/database/repositories'
 * const lessons = await lessonRepository.list()
 */
export const lessonRepository = new LessonRepository()
export default lessonRepository
