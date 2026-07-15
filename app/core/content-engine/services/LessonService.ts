/**
 * LessonService - 课时业务逻辑服务
 * 
 * 设计意图：
 * =========
 * 封装课时相关的业务逻辑，包括数据查询和页面聚合。
 * 
 * 职责边界：
 * =========
 * 1. 查询课时数据（委托给 Repository）
 * 2. 构建页面级数据（LessonPage）
 * 3. 处理关联数据（章节、课程、上一/下一课时）
 * 
 * 为什么需要 Service 层？
 * ====================
 * 1. **业务逻辑复用**：页面聚合逻辑可以被 DatabaseSource 和其他模块复用
 * 2. **解耦**：Repository 只负责数据库操作，Service 负责业务逻辑
 * 3. **可测试性**：通过依赖注入便于单元测试
 * 
 * 替代方案对比：
 * =============
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | **Service 层** | 业务逻辑集中，复用性强 | 增加一层抽象 |
 * | 直接在 Controller 中写逻辑 | 简单直接 | 代码重复，难以维护 |
 * | Repository 包含业务逻辑 | 少一层 | 职责不清，难以测试 |
 * 
 * 本方案优势：
 * ===========
 * - **单一职责**：Repository 只做数据库操作，Service 只做业务逻辑
 * - **可复用性**：getLessonPage 方法可以被多个地方调用
 * - **可测试性**：依赖注入模式便于 Mock
 */
import {
  lessonRepository,
  chapterRepository,
  courseRepository
} from '@core/database/repositories'
import type { LessonRepository, LessonListByChapterRow } from '@core/database/repositories'
import type { ChapterRepository } from '@core/database/repositories'
import type { CourseRepository } from '@core/database/repositories'
import type { Chapter, Lesson, Course } from '../models/index'
import { queries } from '../queries/index'

/** 课时查询类型别名 */
type SelectLesson = Lesson
/** 章节查询类型别名 */
type SelectChapter = Chapter

/**
 * LessonWithChapter - 包含章节信息的课时
 * 
 * 设计意图：
 * =========
 * 在基础课时信息上增加所属章节，便于上层代码处理。
 */
export type LessonWithChapter = Omit<SelectLesson, 'chapter'> & {
  chapter: SelectChapter | null
}

/**
 * LessonServiceDeps - LessonService 的依赖注入接口
 * 
 * 使用依赖注入的原因：
 * ==================
 * 1. **可测试性**：测试时可以注入 Mock Repository
 * 2. **灵活性**：可以替换不同的 Repository 实现
 */
export interface LessonServiceDeps {
  lessons?: LessonRepository
  chapters?: ChapterRepository
  courses?: CourseRepository
}

/**
 * LessonService 类 - 课时业务逻辑服务
 * 
 * 使用场景：
 * ========
 * - DatabaseSource 委托获取页面数据
 * - Admin 后台（已删除，保留接口）
 * - 其他需要课时业务逻辑的模块
 */
export class LessonService {
  /** 课时 Repository */
  lessons: LessonRepository
  /** 章节 Repository */
  chapters: ChapterRepository
  /** 课程 Repository */
  courses: CourseRepository

  /**
   * 构造函数 - 使用依赖注入模式
   * 
   * @param deps 依赖项，包含三个 Repository 的可选实例
   */
  constructor({ lessons = lessonRepository, chapters = chapterRepository, courses = courseRepository }: LessonServiceDeps = {}) {
    this.lessons = lessons
    this.chapters = chapters
    this.courses = courses
  }

  /**
   * 根据章节 slug 获取课时列表
   * 
   * @param chapterSlug 章节的唯一标识
   * @returns Promise<LessonListByChapterRow[]>
   */
  async listByChapter(chapterSlug: string): Promise<LessonListByChapterRow[]> {
    const q = queries.normalizeByChapter(chapterSlug)
    if (!q.isValid) return []
    return this.lessons.listByChapter(q.chapterSlug || String(chapterSlug))
  }

  /**
   * 根据 slug 获取课时（包含章节信息）
   * 
   * 实现逻辑：
   * ========
   * 1. 参数规范化
   * 2. 获取课时基本信息
   * 3. 根据 chapterId 或 chapter slug 获取章节信息
   * 
   * 为什么需要双重查找？
   * ==================
   * 数据库中课时可能同时存储 chapterId（数字 ID）和 chapter（slug），
   * 需要优先使用 ID 查找，再使用 slug 查找作为 fallback。
   * 
   * @param slug 课时的唯一标识
   * @returns Promise<LessonWithChapter | null>
   */
  async getBySlug(slug: string): Promise<LessonWithChapter | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    
    const lesson = await this.lessons.getBySlug(q.slug)
    if (!lesson) return null
    
    let chapter: SelectChapter | null = null
    
    // 优先使用 chapterId 查找
    if (lesson.chapterId) {
      chapter = (await this.chapters.getById(lesson.chapterId)) || null
    }
    // 如果 ID 查找失败，使用 chapter slug 查找
    if (!chapter && lesson.chapter) {
      chapter = (await this.chapters.getBySlug(lesson.chapter)) || null
    }
    
    return { ...lesson, chapter }
  }

  /**
   * 获取所有课时列表
   * 
   * @returns Promise<SelectLesson[]>
   */
  async listAll(): Promise<SelectLesson[]> {
    return this.lessons.list()
  }

  /**
   * 获取课时页面的完整数据
   * 
   * 页面数据包含：
   * ============
   * - lesson: 当前课时
   * - chapter: 所属章节
   * - course: 所属课程
   * - previousLesson: 上一课时
   * - nextLesson: 下一课时
   * 
   * 实现逻辑：
   * ========
   * 1. 参数规范化
   * 2. 获取课时基本信息
   * 3. 获取所属章节
   * 4. 获取所属课程
   * 5. 获取章节下所有课时，计算上一/下一课时
   * 
   * 性能注意：
   * ========
   * 此方法会产生多个数据库查询（课时、章节、课程、课时列表），
   * 在生产环境中建议添加缓存优化。
   * 
   * @param slug 课时的唯一标识
   * @returns Promise<{ lesson, chapter, course, previousLesson, nextLesson } | null>
   */
  async getLessonPage(slug: string): Promise<{
    lesson: SelectLesson
    chapter: SelectChapter | null
    course: Course | null
    previousLesson: SelectLesson | null
    nextLesson: SelectLesson | null
  } | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null

    const lesson = await this.lessons.getBySlug(q.slug)
    if (!lesson) return null

    let chapter: SelectChapter | null = null
    let course: Course | null = null
    let previousLesson: SelectLesson | null = null
    let nextLesson: SelectLesson | null = null

    // 获取所属章节
    if (lesson.chapterId) {
      chapter = (await this.chapters.getById(lesson.chapterId)) || null
    }
    if (!chapter && lesson.chapter) {
      chapter = (await this.chapters.getBySlug(lesson.chapter)) || null
    }

    // 获取所属课程
    if (chapter) {
      if (chapter.courseId) {
        course = (await this.courses.getById(chapter.courseId)) || null
      }
      if (!course && chapter.course) {
        course = (await this.courses.getBySlug(chapter.course)) || null
      }

      // 计算上一/下一课时
      const lessonsInChapter = await this.lessons.listByChapter(chapter.slug)
      const currentIndex = lessonsInChapter.findIndex(l => l.slug === lesson.slug)

      if (currentIndex >= 0) {
        // 获取上一课时
        if (currentIndex > 0) {
          const prevItem = lessonsInChapter[currentIndex - 1]
          if (prevItem) {
            const prev = await this.lessons.getBySlug(prevItem.slug)
            if (prev) previousLesson = prev
          }
        }
        // 获取下一课时
        if (currentIndex < lessonsInChapter.length - 1) {
          const nextItem = lessonsInChapter[currentIndex + 1]
          if (nextItem) {
            const next = await this.lessons.getBySlug(nextItem.slug)
            if (next) nextLesson = next
          }
        }
      }
    }

    return {
      lesson,
      chapter,
      course,
      previousLesson,
      nextLesson
    }
  }
}

/**
 * LessonService 单例实例
 * 
 * 使用方式：
 * ========
 * import { lessonService } from '@ce'
 * const page = await lessonService.getLessonPage('intro')
 */
export const lessonService = new LessonService()
export default lessonService
