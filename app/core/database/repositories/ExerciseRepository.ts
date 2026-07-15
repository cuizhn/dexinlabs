/**
 * ExerciseRepository - 练习数据访问层
 * 
 * 设计意图：
 * =========
 * 封装练习表的数据库操作，提供类型安全的 CRUD 接口。
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
import { getDb, exercises, chapters, type DbInstance } from '../index'
import type { Exercise } from '../../content-engine/models/index'

/** 练习查询类型别名 */
type SelectExercise = Exercise
/** 练习插入类型别名 */
type InsertExercise = typeof exercises.$inferInsert

/**
 * ExerciseFilters - 练习查询过滤条件
 * 
 * 设计意图：
 * =========
 * 定义练习查询的过滤参数，支持按章节、章节 ID、slug 过滤。
 */
export interface ExerciseFilters {
  chapter?: string
  chapterId?: number | string
  slug?: string
}

/**
 * ExerciseListOptions - 练习列表查询选项
 * 
 * 设计意图：
 * =========
 * 在过滤条件基础上增加排序选项，支持按 id 或 order 排序。
 */
export interface ExerciseListOptions extends ExerciseFilters {
  orderBy?: 'id' | 'order'
  order?: 'asc' | 'desc'
}

/**
 * ExerciseListByChapterRow - 按章节查询练习的返回行
 * 
 * 设计意图：
 * =========
 * 定义 listByChapter 方法的返回类型，包含练习的所有字段。
 */
export interface ExerciseListByChapterRow {
  id: SelectExercise['id']
  slug: SelectExercise['slug']
  title: SelectExercise['title']
  summary: SelectExercise['summary']
  description: SelectExercise['description']
  body: SelectExercise['body']
  order: SelectExercise['order']
  chapter: SelectExercise['chapter']
  hint: SelectExercise['hint']
  answer: SelectExercise['answer']
  analysis: SelectExercise['analysis']
  chapterId: SelectExercise['chapterId']
  createdAt: SelectExercise['createdAt']
  updatedAt: SelectExercise['updatedAt']
}

/**
 * ExerciseRepository 类 - 练习数据访问层
 * 
 * 使用场景：
 * ========
 * - ExerciseService 委托查询数据
 * - Admin 后台（已删除，保留接口）
 * - 其他需要直接访问练习数据的模块
 */
export class ExerciseRepository {
  /** 显式传入的数据库实例（用于测试） */
  _explicitDb?: DbInstance | null
  /** 练习表定义 */
  table: typeof exercises

  /**
   * 构造函数 - 支持依赖注入
   * 
   * @param db 数据库实例（可选，用于测试）
   */
  constructor(db?: DbInstance) {
    this._explicitDb = db || null
    this.table = exercises
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
  _buildWhere({ chapter, chapterId, slug }: ExerciseFilters = {}): SQL | undefined {
    const clauses: SQL[] = []
    if (slug) clauses.push(eq(this.table.slug, slug))
    if (chapterId) clauses.push(eq(this.table.chapterId, Number(chapterId)))
    if (chapter) clauses.push(eq(this.table.chapter, chapter))
    return clauses.length ? and(...clauses) : undefined
  }

  /**
   * list - 获取练习列表
   * 
   * 实现逻辑：
   * ========
   * 1. 根据 orderBy 和 order 参数确定排序方式
   * 2. 根据过滤条件构建 WHERE 子句
   * 3. 执行查询并返回结果
   * 
   * @param options 查询选项
   * @returns Promise<SelectExercise[]> 练习列表
   */
  async list({ chapter, chapterId, orderBy = 'order', order = 'asc' }: ExerciseListOptions = {}): Promise<SelectExercise[]> {
    const sortDir = order.toLowerCase() === 'desc' ? desc : asc
    const sortCol = orderBy === 'id' ? this.table.id : this.table.order
    const where = this._buildWhere({ chapter, chapterId })
    let query: any = this._getDb().select().from(this.table)
    if (where) query = query.where(where)
    return query.orderBy(sortDir(sortCol))
  }

  /**
   * listByChapter - 根据章节 slug 获取练习列表
   * 
   * 实现逻辑：
   * ========
   * 1. 使用 LEFT JOIN 关联 chapters 表
   * 2. 使用 OR 条件同时匹配练习的 chapter 字段和章节的 slug 字段
   * 3. 按 order 和 id 升序排列
   * 
   * 为什么需要 LEFT JOIN？
   * ====================
   * 练习可能通过 chapterId（外键）或 chapter（slug）关联章节，
   * 需要同时支持两种方式的查询。
   * 
   * @param chapterSlug 章节的唯一标识
   * @returns Promise<ExerciseListByChapterRow[]> 练习列表
   */
  async listByChapter(chapterSlug: string | undefined | null): Promise<ExerciseListByChapterRow[]> {
    if (!chapterSlug) return []
    const rows = await this._getDb()
      .select({
        id: this.table.id,
        slug: this.table.slug,
        title: this.table.title,
        summary: this.table.summary,
        description: this.table.description,
        body: this.table.body,
        order: this.table.order,
        chapter: this.table.chapter,
        hint: this.table.hint,
        answer: this.table.answer,
        analysis: this.table.analysis,
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
   * getBySlug - 根据 slug 获取练习
   * 
   * @param slug 练习的唯一标识
   * @returns Promise<SelectExercise | null> 练习对象或 null
   */
  async getBySlug(slug: string | undefined | null): Promise<SelectExercise | null> {
    if (!slug) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.slug, slug))
      .limit(1)
    return rows[0] || null
  }

  /**
   * getById - 根据 ID 获取练习
   * 
   * @param id 练习的数字 ID
   * @returns Promise<SelectExercise | null> 练习对象或 null
   */
  async getById(id: number | string | undefined | null): Promise<SelectExercise | null> {
    if (!id) return null
    const rows = await this._getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.id, Number(id)))
      .limit(1)
    return rows[0] || null
  }

  /**
   * getOneByChapter - 获取章节下的第一个练习
   * 
   * 实现逻辑：
   * ========
   * 1. 调用 listByChapter 获取章节下的所有练习
   * 2. 返回第一个练习（按 order 排序）
   * 
   * 设计意图：
   * =========
   * 每个章节通常只有一个练习，提供此方法简化调用。
   * 
   * @param chapterSlug 章节的唯一标识
   * @returns Promise<ExerciseListByChapterRow | null> 练习对象或 null
   */
  async getOneByChapter(chapterSlug: string | undefined | null): Promise<ExerciseListByChapterRow | null> {
    if (!chapterSlug) return null
    const list = await this.listByChapter(chapterSlug)
    return list[0] || null
  }

  /**
   * count - 统计练习数量
   * 
   * @param filters 过滤条件
   * @returns Promise<number> 练习数量
   */
  async count(filters: ExerciseFilters = {}): Promise<number> {
    const where = this._buildWhere(filters)
    let query: any = this._getDb().select({ count: sql<number>`count(*)`.mapWith(Number) }).from(this.table)
    if (where) query = query.where(where)
    const rows = await query
    return Number(rows[0]?.count ?? 0)
  }

  /**
   * create - 创建练习
   * 
   * @param data 练习数据
   * @returns Promise<SelectExercise | null> 创建的练习对象
   */
  async create(data: InsertExercise): Promise<SelectExercise | null> {
    const rows = await this._getDb().insert(this.table).values(data).returning()
    return rows[0] || null
  }

  /**
   * updateBySlug - 根据 slug 更新练习
   * 
   * 实现逻辑：
   * ========
   * 1. 自动设置 updatedAt 为当前时间
   * 2. 禁止更新 id、slug、createdAt 字段
   * 3. 执行更新并返回更新后的记录
   * 
   * @param slug 练习的唯一标识
   * @param data 更新数据
   * @returns Promise<SelectExercise | null> 更新后的练习对象
   */
  async updateBySlug(slug: string, data: Partial<Omit<InsertExercise, 'id' | 'slug' | 'createdAt'>>): Promise<SelectExercise | null> {
    const patch: Partial<InsertExercise> = { ...data, updatedAt: new Date() }
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
   * upsert - 插入或更新练习
   * 
   * 实现逻辑：
   * ========
   * 1. 使用 ON CONFLICT DO UPDATE 实现 upsert
   * 2. 冲突条件为 slug 唯一索引
   * 3. 冲突时更新除 slug 外的所有字段，并设置 updatedAt
   * 
   * @param data 练习数据
   * @returns Promise<SelectExercise | null> 插入或更新后的练习对象
   */
  async upsert(data: InsertExercise): Promise<SelectExercise | null> {
    const { id, createdAt, ...rest } = data || ({} as InsertExercise)
    const payload: Omit<InsertExercise, 'id' | 'createdAt'> = { ...rest }
    const onConflictSet: Partial<InsertExercise> = { ...rest }
    delete (onConflictSet as { slug?: unknown }).slug
    onConflictSet.updatedAt = new Date()
    const rows = await this._getDb()
      .insert(this.table)
      .values(payload as InsertExercise)
      .onConflictDoUpdate({
        target: this.table.slug,
        set: onConflictSet
      })
      .returning()
    return rows[0] || null
  }

  /**
   * deleteBySlug - 根据 slug 删除练习
   * 
   * @param slug 练习的唯一标识
   * @returns Promise<{ rowCount: number | null }> 删除结果
   */
  async deleteBySlug(slug: string): Promise<{ rowCount: number | null }> {
    return this._getDb().delete(this.table).where(eq(this.table.slug, slug))
  }
}

/**
 * ExerciseRepository 单例实例
 * 
 * 使用方式：
 * ========
 * import { exerciseRepository } from '@core/database/repositories'
 * const exercises = await exerciseRepository.list()
 */
export const exerciseRepository = new ExerciseRepository()
export default exerciseRepository
