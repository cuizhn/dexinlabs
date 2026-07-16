/**
 * Content Engine - 内容引擎的核心入口文件
 * 
 * 设计意图：
 * =========
 * 实现外观模式（Facade Pattern），为上层业务代码提供统一、简洁的内容访问接口。
 * 
 * 架构层次：
 * =========
 * Page / Composable
 *     ↓
 * Content Engine Facade (本文件)
 *     ↓
 * ContentSource 接口
 *     ↓
 * FileSource / DatabaseSource / (未来扩展)
 * 
 * 核心原则：
 * =========
 * 1. **统一接口**：上层代码只依赖 ContentEngineFacade，不感知数据源变化
 * 2. **延迟初始化**：根据环境变量延迟加载对应的数据源
 * 3. **单一职责**：Facade 只负责请求转发和参数校验，不包含业务逻辑
 * 
 * 为什么使用外观模式？
 * ==================
 * 1. **简化调用**：将复杂的子系统调用封装为简单的 API
 * 2. **解耦**：上层代码与具体数据源解耦
 * 3. **统一管理**：所有内容访问都通过 Facade 进行，便于监控和日志
 * 
 * 替代方案对比：
 * =============
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | **外观模式** | 统一接口，简化调用 | 增加一层抽象 |
 * | 直接调用 Source | 简单直接 | 上层代码依赖具体实现 |
 * | 依赖注入 | 灵活 | 需要额外的 DI 容器 |
 */
import { FileSource, DatabaseSource } from './sources/index'
import type { ContentSource } from './sources/index'
import { queries } from './queries/index'
import type {
  Course,
  Chapter,
  Lesson,
  Exercise,
  ChapterListOptions,
  QueryOptions,
  ChapterWithRelations
} from './models/index'
import type { LessonPage, ChapterPage, CoursePage } from './dto/index'

/**
 * ContentEngineFacade 接口 - Content Engine 的统一对外 API
 * 
 * 方法分类：
 * --------
 * 1. 基础查询（getXxx）：获取单个实体，支持查询选项
 * 2. 列表查询（listXxx）：获取实体列表
 * 3. 页面聚合（getXxxPage）：获取页面级别的组合数据
 * 4. 默认值（getDefaultCourse）：获取默认课程
 */
export interface ContentEngineFacade {
  getCourse(slug: string, opts?: QueryOptions): Promise<Course | null>
  getChapter(slug: string, opts?: QueryOptions): Promise<ChapterWithRelations | null>
  getLesson(slug: string, opts?: QueryOptions): Promise<Lesson | null>
  getExercise(slug: string, opts?: QueryOptions): Promise<Exercise | null>
  listCourses(): Promise<Course[]>
  listChapters(opts?: ChapterListOptions): Promise<Chapter[]>
  listLessons(chapterSlug?: string): Promise<Lesson[]>
  getLessonPage(slug: string): Promise<LessonPage | null>
  getChapterPage(slug: string): Promise<ChapterPage | null>
  getCoursePage(slug: string): Promise<CoursePage | null>
  getDefaultCourse(): Promise<CoursePage | null>
}

/**
 * 模块级状态变量（私有）
 * 
 * 使用模块级变量的原因：
 * ====================
 * 1. **单例模式**：确保整个应用只有一个 ContentSource 实例
 * 2. **延迟初始化**：只在第一次调用时初始化数据源
 * 3. **性能优化**：避免重复创建数据源实例
 */
let __initialized = false
let __source: ContentSource | null = null

/**
 * 根据环境变量获取数据源类型
 * 
 * 实现逻辑：
 * ========
 * 读取环境变量 CONTENT_SOURCE：
 * - 'file' → 返回 'file'（开发环境）
 * - 其他值或未设置 → 返回 'database'（生产环境）
 * 
 * 为什么默认使用 database？
 * =======================
 * 安全考虑：生产环境如果忘记配置环境变量，默认使用数据库是更安全的选择。
 * 
 * @returns 'file' | 'database' 数据源类型
 */
function getSourceType(): 'file' | 'database' {
  const env = process.env.CONTENT_SOURCE?.toLowerCase() || ''
  return env === 'file' ? 'file' : 'database'
}

/**
 * 创建数据源实例
 * 
 * 实现逻辑：
 * ========
 * 根据 getSourceType() 的返回值创建对应的数据源实例：
 * - 'file' → 创建 FileSource（开发环境）
 * - 'database' → 创建 DatabaseSource（生产环境）
 * 
 * 为什么不在这里处理初始化？
 * ========================
 * 延迟初始化的需要：只有在第一次调用时才需要初始化数据源，避免启动时的不必要开销。
 * 
 * @returns ContentSource 数据源实例
 */
function createSource(): ContentSource {
  const type = getSourceType()
  if (type === 'file') {
    return new FileSource()
  }
  return new DatabaseSource()
}

/**
 * 确保数据源已初始化
 * 
 * 实现逻辑：
 * ========
 * 1. 如果已初始化，直接返回
 * 2. 如果是数据库模式，动态导入 database 模块（确保数据库连接已建立）
 * 3. 创建数据源实例
 * 4. 标记为已初始化
 * 
 * 为什么使用动态 import？
 * ======================
 * 1. **按需加载**：只有在需要数据库时才加载数据库模块
 * 2. **避免启动时错误**：开发环境可能没有配置 DATABASE_URL，动态 import + try/catch 可以优雅处理
 * 3. **性能优化**：减少启动时间
 * 
 * @returns Promise<void>
 */
async function ensureInitialized(): Promise<void> {
  if (__initialized) return
  
  const type = getSourceType()
  
  // 如果是数据库模式，动态导入数据库模块以确保连接已建立
  if (type === 'database') {
    try {
      await import('../database')
    } catch {
      // 忽略导入错误，可能是开发环境没有配置数据库
    }
  }
  
  __source = createSource()
  __initialized = true
}

/**
 * Content Engine Facade 实例
 * 
 * 每个方法的处理流程：
 * ===================
 * 1. 参数校验（通过 queries 模块）
 * 2. 确保数据源已初始化
 * 3. 转发请求到具体的数据源
 * 
 * 为什么每个方法都调用 ensureInitialized()？
 * ========================================
 * 异步初始化的需要：数据源的初始化可能是异步的（如数据库连接），
 * 每个方法都需要等待初始化完成后才能正常工作。
 */
const facade: ContentEngineFacade = {
  /**
   * 根据 slug 获取课程
   * 
   * @param slug 课程的唯一标识
   * @param opts 查询选项
   * @returns Promise<Course | null>
   */
  async getCourse(slug: string, opts: QueryOptions = {}): Promise<Course | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    await ensureInitialized()
    return __source?.getCourse(q.slug) || null
  },

  /**
   * 根据 slug 获取章节（包含关联数据）
   * 
   * 返回的数据结构：
   * ============
   * {
   *   chapter: Chapter,
   *   lessons: Lesson[],
   *   exercise: Exercise | null
   * }
   * 
   * @param slug 章节的唯一标识
   * @param opts 查询选项
   * @returns Promise<ChapterWithRelations | null>
   */
  async getChapter(slug: string, opts: QueryOptions = {}): Promise<ChapterWithRelations | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    await ensureInitialized()
    const chapter = await __source?.getChapter(q.slug)
    if (!chapter) return null
    const lessons = chapter.lessons || []
    return {
      chapter,
      lessons: lessons as unknown as ChapterWithRelations['lessons'],
      exercise: null
    }
  },

  /**
   * 根据 slug 获取课时
   * 
   * @param slug 课时的唯一标识
   * @param opts 查询选项
   * @returns Promise<Lesson | null>
   */
  async getLesson(slug: string, opts: QueryOptions = {}): Promise<Lesson | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    await ensureInitialized()
    return __source?.getLesson(q.slug) || null
  },

  /**
   * 根据 slug 获取练习
   * 
   * @param slug 练习的唯一标识
   * @param opts 查询选项
   * @returns Promise<Exercise | null>
   */
  async getExercise(slug: string, opts: QueryOptions = {}): Promise<Exercise | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    await ensureInitialized()
    return __source?.getExercise(q.slug) || null
  },

  /**
   * 获取所有课程列表
   * 
   * @returns Promise<Course[]>
   */
  async listCourses(): Promise<Course[]> {
    await ensureInitialized()
    return __source?.listCourses() || []
  },

  /**
   * 获取章节列表，可选按课程筛选
   * 
   * @param opts 查询选项，可包含 courseSlug
   * @returns Promise<Chapter[]>
   */
  async listChapters(opts: ChapterListOptions = {}): Promise<Chapter[]> {
    const q = queries.normalizeListChapters(opts)
    await ensureInitialized()
    return __source?.listChapters(q.courseSlug || undefined) || []
  },

  /**
   * 获取课时列表，可选按章节筛选
   * 
   * @param chapterSlug 章节 slug，用于限定课时范围
   * @returns Promise<Lesson[]>
   */
  async listLessons(chapterSlug?: string): Promise<Lesson[]> {
    await ensureInitialized()
    return __source?.listLessons(chapterSlug) || []
  },

  /**
   * 获取课时页面的完整数据
   * 
   * @param slug 课时的唯一标识
   * @returns Promise<LessonPage | null>
   */
  async getLessonPage(slug: string): Promise<LessonPage | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    await ensureInitialized()
    return __source?.getLessonPage(q.slug) || null
  },

  /**
   * 获取章节页面的完整数据
   * 
   * @param slug 章节的唯一标识
   * @returns Promise<ChapterPage | null>
   */
  async getChapterPage(slug: string): Promise<ChapterPage | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    await ensureInitialized()
    return __source?.getChapterPage(q.slug) || null
  },

  /**
   * 获取课程页面的完整数据
   * 
   * @param slug 课程的唯一标识
   * @returns Promise<CoursePage | null>
   */
  async getCoursePage(slug: string): Promise<CoursePage | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    await ensureInitialized()
    return __source?.getCoursePage(q.slug) || null
  },

  /**
   * 获取默认课程的页面数据
   * 
   * @returns Promise<CoursePage | null>
   */
  async getDefaultCourse(): Promise<CoursePage | null> {
    await ensureInitialized()
    return __source?.getDefaultCourse() || null
  }
}

/**
 * 创建 Content Engine Facade 实例
 * 
 * 为什么需要 createContentEngine() 和 getContentEngine() 两个方法？
 * =============================================================
 * - createContentEngine(): 显式创建新实例，用于测试或特殊场景
 * - getContentEngine(): 返回单例实例，用于正常业务场景
 * 
 * @returns ContentEngineFacade 实例
 */
export function createContentEngine(): ContentEngineFacade {
  return facade
}

/**
 * 获取 Content Engine Facade 单例实例
 * 
 * @returns ContentEngineFacade 单例实例
 */
export function getContentEngine(): ContentEngineFacade {
  return facade
}

/**
 * 导出 Service 层（向后兼容）
 * 
 * 为什么导出 Service？
 * ===================
 * 历史原因：早期代码直接使用 Service 层访问数据。
 * 虽然推荐使用 Facade，但为了向后兼容，仍然导出 Service。
 */
export {
  chapterService,
  courseService,
  lessonService,
  exerciseService
} from './services/index'

/**
 * 导出 Repository 层（向后兼容）
 * 
 * 为什么导出 Repository？
 * ======================
 * 历史原因：早期代码直接使用 Repository 层访问数据。
 * 虽然推荐使用 Facade，但为了向后兼容，仍然导出 Repository。
 */
export {
  chapterRepository,
  lessonRepository,
  courseRepository,
  exerciseRepository,
  assetRepository
} from '@database/repositories'

/**
 * 导出 queries 模块（用于参数校验）
 */
export { queries } from './queries/index'

/**
 * 导出 Sources 模块（用于扩展）
 */
export { FileSource, DatabaseSource } from './sources/index'
export type { ContentSource } from './sources/index'

/**
 * 导出 Models 类型（用于类型定义）
 */
export type {
  Course,
  Chapter,
  Lesson,
  Exercise,
  Asset,
  BaseContentEntity,
  ChapterListOptions,
  QueryOptions,
  ChapterWithRelations
} from './models/index'

/**
 * 导出 DTO 类型（用于页面数据结构）
 */
export type {
  LessonPage,
  ChapterPage,
  CoursePage
} from './dto/index'

/**
 * 导出 Queries 类型（用于查询选项）
 */
export type {
  BySlugQuery,
  ByCourseQuery,
  ByChapterQuery,
  ListSortQuery,
  ListPaginateQuery,
  ListChaptersQuery,
  ListLessonsQuery,
  ListExercisesQuery,
  NormalizedBySlugQuery,
  NormalizedByCourseQuery,
  NormalizedByChapterQuery,
  NormalizedListSort,
  NormalizedListPaginate,
  NormalizedListChaptersQuery,
  NormalizedListLessonsQuery,
  NormalizedListExercisesQuery
} from './queries/index'

/**
 * 默认导出：Content Engine Facade 实例
 * 
 * 使用方式：
 * ========
 * import contentEngine from '@content'
 * const course = await contentEngine.getCourse('math')
 */
export default facade
