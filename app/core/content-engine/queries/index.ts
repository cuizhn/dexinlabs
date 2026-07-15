/**
 * Content Engine Queries - 查询参数规范化模块
 * 
 * 设计意图：
 * =========
 * 提供统一的查询参数校验和规范化逻辑，确保输入参数的一致性和安全性。
 * 
 * 为什么需要查询规范化？
 * ===================
 * 1. **参数校验**：确保必填参数存在，防止无效查询
 * 2. **格式统一**：将不同格式的输入转换为统一格式（如 string 转 number）
 * 3. **类型安全**：通过 TypeScript 确保参数类型正确
 * 4. **防御性编程**：防止恶意输入导致的安全问题
 * 
 * 设计模式：
 * =========
 * - 输入接口（如 BySlugQuery）：定义原始输入格式
 * - 输出接口（如 NormalizedBySlugQuery）：定义规范化后的格式
 * - 规范化函数（如 normalizeBySlug）：将输入转换为输出
 * 
 * 替代方案对比：
 * =============
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | **集中式规范化** | 统一管理，便于维护 | 增加一层抽象 |
 * | 分散式校验 | 简单直接 | 重复代码，难以维护 |
 * | 第三方库（如 Zod） | 功能强大 | 引入额外依赖 |
 * 
 * 本方案优势：
 * ===========
 * - **轻量**：无额外依赖
 * - **可控**：完全自定义校验逻辑
 * - **一致**：所有查询使用相同的校验模式
 */

/**
 * BySlugQuery - 按 slug 查询的输入接口
 * 
 * 用途：用于 getCourse、getChapter、getLesson、getExercise 等方法
 */
export interface BySlugQuery {
  slug: string
}

/**
 * ByCourseQuery - 按课程查询的输入接口
 * 
 * 字段说明：
 * =========
 * - course: 课程标识符（兼容旧版本，可能是 slug 或 id）
 * - courseId: 课程数据库 ID
 * - courseSlug: 课程 slug
 */
export interface ByCourseQuery {
  course?: string | null
  courseId?: number | string | null
  courseSlug?: string | null
}

/**
 * ByChapterQuery - 按章节查询的输入接口
 * 
 * 字段说明：
 * =========
 * - chapter: 章节标识符（兼容旧版本）
 * - chapterId: 章节数据库 ID
 * - chapterSlug: 章节 slug
 */
export interface ByChapterQuery {
  chapter?: string | null
  chapterId?: number | string | null
  chapterSlug?: string | null
}

/**
 * ListSortQuery - 列表排序查询的输入接口
 */
export interface ListSortQuery {
  orderBy?: 'id' | 'order' | (string & {})
  order?: 'asc' | 'desc'
}

/**
 * ListPaginateQuery - 列表分页查询的输入接口
 */
export interface ListPaginateQuery {
  limit?: number | string | null
  offset?: number | string | null
}

/**
 * ListChaptersQuery - 章节列表查询的输入接口
 * 
 * 继承自 ByCourseQuery + ListSortQuery + ListPaginateQuery
 */
export interface ListChaptersQuery extends ByCourseQuery, ListSortQuery, ListPaginateQuery {
}

/**
 * ListLessonsQuery - 课时列表查询的输入接口
 * 
 * 继承自 ByChapterQuery + ListSortQuery + ListPaginateQuery
 */
export interface ListLessonsQuery extends ByChapterQuery, ListSortQuery, ListPaginateQuery {
}

/**
 * ListExercisesQuery - 练习列表查询的输入接口
 * 
 * 继承自 ByChapterQuery + ListSortQuery + ListPaginateQuery
 */
export interface ListExercisesQuery extends ByChapterQuery, ListSortQuery, ListPaginateQuery {
}

/**
 * NormalizedBySlugQuery - 按 slug 查询的规范化输出接口
 * 
 * 字段说明：
 * =========
 * - slug: 清理后的 slug
 * - isValid: 是否有效
 * - error: 错误信息（isValid 为 false 时存在）
 */
export interface NormalizedBySlugQuery {
  slug: string
  isValid: boolean
  error?: string
}

/**
 * NormalizedByCourseQuery - 按课程查询的规范化输出接口
 */
export interface NormalizedByCourseQuery {
  courseSlug?: string
  courseId?: number
  isValid: boolean
  error?: string
}

/**
 * NormalizedByChapterQuery - 按章节查询的规范化输出接口
 */
export interface NormalizedByChapterQuery {
  chapterSlug?: string
  chapterId?: number
  isValid: boolean
  error?: string
}

/**
 * NormalizedListSort - 列表排序的规范化输出接口
 * 
 * 确保 orderBy 和 order 有默认值
 */
export interface NormalizedListSort {
  orderBy: 'id' | 'order'
  order: 'asc' | 'desc'
}

/**
 * NormalizedListPaginate - 列表分页的规范化输出接口
 */
export interface NormalizedListPaginate {
  limit?: number
  offset?: number
}

/**
 * NormalizedListChaptersQuery - 章节列表查询的规范化输出接口
 */
export interface NormalizedListChaptersQuery extends NormalizedByCourseQuery, NormalizedListSort, NormalizedListPaginate {
}

/**
 * NormalizedListLessonsQuery - 课时列表查询的规范化输出接口
 */
export interface NormalizedListLessonsQuery extends NormalizedByChapterQuery, NormalizedListSort, NormalizedListPaginate {
}

/**
 * NormalizedListExercisesQuery - 练习列表查询的规范化输出接口
 */
export interface NormalizedListExercisesQuery extends NormalizedByChapterQuery, NormalizedListSort, NormalizedListPaginate {
}

/**
 * 将值转换为数字或 undefined
 * 
 * 实现逻辑：
 * ========
 * 1. 如果值为 null、undefined 或空字符串，返回 undefined
 * 2. 尝试转换为数字
 * 3. 如果转换结果是有限数字，返回数字；否则返回 undefined
 * 
 * 为什么不返回 null？
 * ==================
 * 使用 undefined 表示"未提供"，与 TypeScript 的可选字段语义一致。
 * 
 * @param value 原始值
 * @returns number | undefined
 */
function toNumberOrUndefined(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

/**
 * 规范化排序参数
 * 
 * 实现逻辑：
 * ========
 * 1. orderBy: 如果输入是 'id' 或 'order'，使用输入值；否则使用默认值 'order'
 * 2. order: 如果输入是 'asc' 或 'desc'，使用输入值；否则使用默认值 'asc'
 * 
 * 为什么默认按 order 字段升序？
 * ===========================
 * order 字段是用户手动设置的排序序号，通常比数据库 ID 更符合业务逻辑。
 * 
 * @param input 排序参数
 * @returns NormalizedListSort
 */
function normalizeSort(input: ListSortQuery = {}): NormalizedListSort {
  const orderBy =
    (input.orderBy === 'id' || input.orderBy === 'order')
      ? (input.orderBy as 'id' | 'order')
      : ('order' as const)
  const order =
    (input.order === 'asc' || input.order === 'desc')
      ? (input.order as 'asc' | 'desc')
      : ('asc' as const)
  return { orderBy, order }
}

/**
 * 规范化分页参数
 * 
 * 实现逻辑：
 * ========
 * 1. 将 limit 和 offset 转换为数字
 * 2. 只有当值有效时才添加到结果中
 * 3. limit 必须大于 0，offset 必须大于等于 0
 * 
 * @param input 分页参数
 * @returns NormalizedListPaginate
 */
function normalizePaginate(input: ListPaginateQuery = {}): NormalizedListPaginate {
  const result: NormalizedListPaginate = {}
  const limit = toNumberOrUndefined(input.limit)
  const offset = toNumberOrUndefined(input.offset)
  if (limit !== undefined && limit > 0) result.limit = limit
  if (offset !== undefined && offset >= 0) result.offset = offset
  return result
}

/**
 * 规范化按 slug 查询的参数
 * 
 * 实现逻辑：
 * ========
 * 1. 支持多种输入格式：字符串、对象、null、undefined
 * 2. 清理并 trim slug
 * 3. 如果 slug 为空，返回无效状态
 * 
 * @param input 原始输入
 * @returns NormalizedBySlugQuery
 */
export function normalizeBySlug(input: string | BySlugQuery | null | undefined): NormalizedBySlugQuery {
  const slug = typeof input === 'string' ? input : (input && typeof input === 'object' ? input.slug : '')
  const clean = String(slug || '').trim()
  if (!clean) {
    return { slug: '', isValid: false, error: 'slug is required' }
  }
  return { slug: clean, isValid: true }
}

/**
 * 规范化按课程查询的参数
 * 
 * 实现逻辑：
 * ========
 * 1. 支持多种输入格式：字符串、对象、null、undefined
 * 2. 优先使用 courseSlug，其次使用 course（兼容旧版本）
 * 3. 将 courseId 转换为数字
 * 4. 如果 courseSlug 和 courseId 都不存在，返回无效状态
 * 
 * @param input 原始输入
 * @returns NormalizedByCourseQuery
 */
export function normalizeByCourse(input: ByCourseQuery | string | null | undefined): NormalizedByCourseQuery {
  const raw: ByCourseQuery = typeof input === 'string'
    ? { courseSlug: input }
    : (input && typeof input === 'object' ? input : {})
  const courseSlugRaw =
    raw.courseSlug !== undefined && raw.courseSlug !== null ? raw.courseSlug : raw.course
  const courseSlug = typeof courseSlugRaw === 'string' ? courseSlugRaw.trim() : undefined
  const courseId = toNumberOrUndefined(raw.courseId)
  if (!courseSlug && courseId === undefined) {
    return { isValid: false, error: 'courseSlug or courseId is required' }
  }
  return {
    courseSlug,
    courseId,
    isValid: true
  }
}

/**
 * 规范化按章节查询的参数
 * 
 * 实现逻辑：与 normalizeByCourse 类似
 * 
 * @param input 原始输入
 * @returns NormalizedByChapterQuery
 */
export function normalizeByChapter(input: ByChapterQuery | string | null | undefined): NormalizedByChapterQuery {
  const raw: ByChapterQuery = typeof input === 'string'
    ? { chapterSlug: input }
    : (input && typeof input === 'object' ? input : {})
  const chapterSlugRaw =
    raw.chapterSlug !== undefined && raw.chapterSlug !== null ? raw.chapterSlug : raw.chapter
  const chapterSlug = typeof chapterSlugRaw === 'string' ? chapterSlugRaw.trim() : undefined
  const chapterId = toNumberOrUndefined(raw.chapterId)
  if (!chapterSlug && chapterId === undefined) {
    return { isValid: false, error: 'chapterSlug or chapterId is required' }
  }
  return {
    chapterSlug,
    chapterId,
    isValid: true
  }
}

/**
 * 规范化章节列表查询参数
 * 
 * 实现逻辑：
 * ========
 * 1. 转换输入格式
 * 2. 分别规范化按课程查询、排序、分页参数
 * 3. 合并结果
 * 
 * @param input 原始输入
 * @returns NormalizedListChaptersQuery
 */
export function normalizeListChapters(input: ListChaptersQuery | string | null | undefined): NormalizedListChaptersQuery {
  const raw: ListChaptersQuery = typeof input === 'string'
    ? { courseSlug: input }
    : (input && typeof input === 'object' ? input : {})
  const byCourse = normalizeByCourse({
    course: raw.course,
    courseId: raw.courseId,
    courseSlug: raw.courseSlug
  })
  const sort = normalizeSort(raw)
  const paginate = normalizePaginate(raw)
  return {
    ...byCourse,
    ...sort,
    ...paginate
  }
}

/**
 * 规范化课时列表查询参数
 * 
 * 实现逻辑：与 normalizeListChapters 类似
 * 
 * @param input 原始输入
 * @returns NormalizedListLessonsQuery
 */
export function normalizeListLessons(input: ListLessonsQuery | string | null | undefined): NormalizedListLessonsQuery {
  const raw: ListLessonsQuery = typeof input === 'string'
    ? { chapterSlug: input }
    : (input && typeof input === 'object' ? input : {})
  const byChapter = normalizeByChapter({
    chapter: raw.chapter,
    chapterId: raw.chapterId,
    chapterSlug: raw.chapterSlug
  })
  const sort = normalizeSort(raw)
  const paginate = normalizePaginate(raw)
  return {
    ...byChapter,
    ...sort,
    ...paginate
  }
}

/**
 * 规范化练习列表查询参数
 * 
 * 实现逻辑：与 normalizeListLessons 类似
 * 
 * @param input 原始输入
 * @returns NormalizedListExercisesQuery
 */
export function normalizeListExercises(input: ListExercisesQuery | string | null | undefined): NormalizedListExercisesQuery {
  const raw: ListExercisesQuery = typeof input === 'string'
    ? { chapterSlug: input }
    : (input && typeof input === 'object' ? input : {})
  const byChapter = normalizeByChapter({
    chapter: raw.chapter,
    chapterId: raw.chapterId,
    chapterSlug: raw.chapterSlug
  })
  const sort = normalizeSort(raw)
  const paginate = normalizePaginate(raw)
  return {
    ...byChapter,
    ...sort,
    ...paginate
  }
}

/**
 * queries 对象 - 统一导出所有规范化函数
 * 
 * 使用方式：
 * ========
 * import { queries } from '@ce'
 * const result = queries.normalizeBySlug('math')
 */
export const queries = {
  normalizeBySlug,
  normalizeByCourse,
  normalizeByChapter,
  normalizeListChapters,
  normalizeListLessons,
  normalizeListExercises
}

export default queries
