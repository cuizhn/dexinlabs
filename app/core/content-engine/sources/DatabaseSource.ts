/**
 * DatabaseSource - ContentSource 接口的数据库实现
 * 
 * 设计意图：
 * =========
 * 为生产环境提供基于 PostgreSQL 数据库的内容数据源，支持在线编辑、性能优化和数据持久化。
 * 
 * 架构层次：
 * =========
 * DatabaseSource → Service Layer → Repository Layer → Drizzle ORM → PostgreSQL
 * 
 * 为什么这样分层？
 * ==============
 * 1. **单一职责**：DatabaseSource 只负责实现 ContentSource 接口，不包含业务逻辑
 * 2. **复用性**：Service Layer 包含页面聚合逻辑，可以被其他模块复用
 * 3. **可测试性**：依赖注入模式便于单元测试
 * 
 * 替代方案对比：
 * =============
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | **委托 Service** | 复用业务逻辑，代码简洁 | 间接依赖，调试路径较长 |
 * | 直接调用 Repository | 直接，调试方便 | 重复代码，违反 DRY |
 * | 内联 SQL | 性能最优 | 可维护性差，SQL 注入风险 |
 * 
 * 本方案优势：
 * ===========
 * - **代码复用**：Service Layer 的页面聚合逻辑只需实现一次
 * - **类型安全**：通过 TypeScript 确保数据结构一致性
 * - **可扩展性**：可以轻松切换数据库实现（如 MySQL）
 * - **事务支持**：通过 Drizzle ORM 支持事务操作
 */
import {
  courseRepository,
  chapterRepository,
  lessonRepository,
  exerciseRepository
} from '@core/database/repositories'
import type { CourseRepository, ChapterRepository, LessonRepository, ExerciseRepository } from '@core/database/repositories'
import type { ContentSource } from './types'
import type { Course, Chapter, Lesson, Exercise } from '../models/index'
import type { LessonPage, ChapterPage, CoursePage } from '../dto/index'
import { courseService, chapterService, lessonService } from '../services/index'

/**
 * DatabaseSource 的依赖注入接口
 * 
 * 使用依赖注入的原因：
 * ==================
 * 1. **可测试性**：测试时可以注入 Mock Repository
 * 2. **灵活性**：可以替换不同的 Repository 实现
 * 3. **解耦**：DatabaseSource 不直接依赖具体的 Repository 实例
 */
export interface DatabaseSourceDeps {
  courses?: CourseRepository
  chapters?: ChapterRepository
  lessons?: LessonRepository
  exercises?: ExerciseRepository
}

/**
 * DatabaseSource 类 - ContentSource 接口的数据库实现
 * 
 * 使用场景：
 * ========
 * - 生产环境（CONTENT_SOURCE=database）
 * - 需要数据持久化的场景
 * - 需要在线编辑功能的场景
 * 
 * 注意：
 * =====
 * - 所有数据来自 PostgreSQL 数据库
 * - 页面聚合方法委托给 Service Layer 实现
 */
export class DatabaseSource implements ContentSource {
  /** 课程 Repository，用于课程数据的 CRUD 操作 */
  private courses: CourseRepository
  /** 章节 Repository，用于章节数据的 CRUD 操作 */
  private chapters: ChapterRepository
  /** 课时 Repository，用于课时数据的 CRUD 操作 */
  private lessons: LessonRepository
  /** 练习 Repository，用于练习数据的 CRUD 操作 */
  private exercises: ExerciseRepository

  /**
   * 构造函数 - 使用依赖注入模式
   * 
   * 为什么使用依赖注入？
   * ==================
   * - 测试时可以注入 Mock 对象
   * - 便于替换实现
   * - 符合控制反转（IoC）原则
   * 
   * @param deps 依赖项，包含四个 Repository 的可选实例
   */
  constructor({
    courses = courseRepository,
    chapters = chapterRepository,
    lessons = lessonRepository,
    exercises = exerciseRepository
  }: DatabaseSourceDeps = {}) {
    this.courses = courses
    this.chapters = chapters
    this.lessons = lessons
    this.exercises = exerciseRepository
  }

  /**
   * 根据 slug 获取课程
   * 
   * 实现逻辑：
   * ========
   * 1. 从数据库获取课程基本信息
   * 2. 递归获取章节列表（包含课时）
   * 
   * 为什么需要递归获取关联数据？
   * ===========================
   * 数据库使用关系模型存储数据，课程、章节、课时是分离的表。
   * 为了返回与 FileSource 一致的数据结构，需要手动关联。
   * 
   * @param slug 课程的唯一标识
   * @returns Promise<Course | null>
   */
  async getCourse(slug: string): Promise<Course | null> {
    // 从数据库获取课程基本信息
    const course = await this.courses.getBySlug(slug)
    if (!course) return null

    // 获取该课程下的所有章节
    const chapters = await this.chapters.listByCourse(slug)
    
    // 为每个章节获取课时列表
    const chaptersWithLessons: Chapter[] = []
    for (const chapter of chapters) {
      const lessons = await this.lessons.listByChapter(chapter.slug)
      chaptersWithLessons.push({ ...chapter, lessons } as unknown as Chapter)
    }

    // 返回包含章节树的课程对象
    return { ...course, chapters: chaptersWithLessons } as unknown as Course
  }

  /**
   * 根据 slug 获取章节
   * 
   * 实现逻辑：
   * ========
   * 1. 从数据库获取章节基本信息
   * 2. 获取章节下的课时列表
   * 3. 获取章节关联的练习
   * 
   * @param slug 章节的唯一标识
   * @returns Promise<Chapter | null>
   */
  async getChapter(slug: string): Promise<Chapter | null> {
    const chapter = await this.chapters.getBySlug(slug)
    if (!chapter) return null

    // 获取章节下的课时列表
    const lessons = await this.lessons.listByChapter(slug)
    // 获取章节关联的练习（每个章节最多一个练习）
    const exercise = await this.exercises.getOneByChapter(slug)

    return {
      ...chapter,
      lessons: lessons as unknown as Lesson[],
      exercises: exercise ? [exercise] : []
    } as unknown as Chapter
  }

  /**
   * 根据 slug 获取课时
   * 
   * 实现逻辑：直接委托给 Repository
   * 
   * @param slug 课时的唯一标识
   * @returns Promise<Lesson | null>
   */
  async getLesson(slug: string): Promise<Lesson | null> {
    return this.lessons.getBySlug(slug) as unknown as Promise<Lesson | null>
  }

  /**
   * 根据 slug 获取练习
   * 
   * 实现逻辑：直接委托给 Repository
   * 
   * @param slug 练习的唯一标识
   * @returns Promise<Exercise | null>
   */
  async getExercise(slug: string): Promise<Exercise | null> {
    return this.exercises.getBySlug(slug) as unknown as Promise<Exercise | null>
  }

  /**
   * 获取所有课程列表
   * 
   * 实现逻辑：
   * ========
   * 1. 获取所有课程基本信息
   * 2. 为每个课程递归获取章节和课时
   * 
   * 性能注意：
   * ========
   * 此方法会产生 N+1 查询问题（N 个课程 + 1 个初始查询）。
   * 在生产环境中，建议添加缓存或使用 Drizzle ORM 的 join 查询优化。
   * 
   * @returns Promise<Course[]>
   */
  async listCourses(): Promise<Course[]> {
    const courses = await this.courses.list()
    const result: Course[] = []

    for (const course of courses) {
      const chapters = await this.chapters.listByCourse(course.slug)
      const chaptersWithLessons: Chapter[] = []
      
      for (const chapter of chapters) {
        const lessons = await this.lessons.listByChapter(chapter.slug)
        chaptersWithLessons.push({ ...chapter, lessons } as unknown as Chapter)
      }
      
      result.push({ ...course, chapters: chaptersWithLessons } as unknown as Course)
    }

    return result
  }

  /**
   * 获取章节列表
   * 
   * 实现逻辑：
   * ========
   * 1. 根据课程 slug 获取章节列表
   * 2. 为每个章节获取课时列表
   * 
   * @param courseSlug 课程 slug，用于限定章节范围
   * @returns Promise<Chapter[]>
   */
  async listChapters(courseSlug?: string): Promise<Chapter[]> {
    if (!courseSlug) return []
    
    const chapters = await this.chapters.listByCourse(courseSlug)
    const result: Chapter[] = []

    for (const chapter of chapters) {
      const lessons = await this.lessons.listByChapter(chapter.slug)
      result.push({ ...chapter, lessons } as unknown as Chapter)
    }

    return result
  }

  /**
   * 获取课时列表
   * 
   * 实现逻辑：直接委托给 Repository
   * 
   * @param chapterSlug 章节 slug，用于限定课时范围
   * @returns Promise<Lesson[]>
   */
  async listLessons(chapterSlug?: string): Promise<Lesson[]> {
    if (!chapterSlug) return []
    return this.lessons.listByChapter(chapterSlug) as unknown as Promise<Lesson[]>
  }

  /**
   * 获取课时页面的完整数据
   * 
   * 实现逻辑：委托给 LessonService
   * 
   * 为什么委托给 Service？
   * ====================
   * LessonService.getLessonPage() 包含复杂的页面聚合逻辑：
   * - 获取课时信息
   * - 获取所属章节和课程
   * - 计算上一/下一课时
   * 这些逻辑在 Service 层实现一次，DatabaseSource 和其他地方都可以复用。
   * 
   * @param slug 课时 slug
   * @returns Promise<LessonPage | null>
   */
  async getLessonPage(slug: string): Promise<LessonPage | null> {
    return lessonService.getLessonPage(slug) as unknown as Promise<LessonPage | null>
  }

  /**
   * 获取章节页面的完整数据
   * 
   * 实现逻辑：委托给 ChapterService
   * 
   * @param slug 章节 slug
   * @returns Promise<ChapterPage | null>
   */
  async getChapterPage(slug: string): Promise<ChapterPage | null> {
    return chapterService.getChapterPage(slug) as unknown as Promise<ChapterPage | null>
  }

  /**
   * 获取课程页面的完整数据
   * 
   * 实现逻辑：委托给 CourseService
   * 
   * @param slug 课程 slug
   * @returns Promise<CoursePage | null>
   */
  async getCoursePage(slug: string): Promise<CoursePage | null> {
    return courseService.getCoursePage(slug) as unknown as Promise<CoursePage | null>
  }

  /**
   * 获取默认课程
   * 
   * 实现逻辑：委托给 CourseService
   * 
   * @returns Promise<CoursePage | null>
   */
  async getDefaultCourse(): Promise<CoursePage | null> {
    return courseService.getDefault() as unknown as Promise<CoursePage | null>
  }
}
