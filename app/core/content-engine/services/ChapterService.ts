/**
 * ChapterService - 章节业务逻辑服务
 * 
 * 设计意图：
 * =========
 * 封装章节相关的业务逻辑，包括数据查询和页面聚合。
 * 
 * 职责边界：
 * =========
 * 1. 查询章节数据（委托给 Repository）
 * 2. 构建页面级数据（ChapterPage）
 * 3. 处理关联数据（课程、课时、练习、上一/下一章节）
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
 * - **可复用性**：getChapterPage 方法可以被多个地方调用
 * - **可测试性**：依赖注入模式便于 Mock
 */
import {
  chapterRepository,
  lessonRepository,
  exerciseRepository,
  courseRepository
} from '@core/database/repositories'
import type { ChapterRepository, ChapterListByCourseRow } from '@core/database/repositories'
import type { LessonRepository, LessonListByChapterRow } from '@core/database/repositories'
import type { ExerciseRepository, ExerciseListByChapterRow } from '@core/database/repositories'
import type { CourseRepository } from '@core/database/repositories'
import type { Chapter, Lesson, Exercise, Course } from '../models/index'
import { queries } from '../queries/index'

/** 章节查询类型别名 */
type SelectChapter = Chapter
/** 课时查询类型别名 */
type SelectLesson = Lesson
/** 练习查询类型别名 */
type SelectExercise = Exercise

/**
 * ChapterWithRelations - 包含关联数据的章节
 * 
 * 设计意图：
 * =========
 * 在基础章节信息上增加关联的课时和练习，便于上层代码处理。
 */
export interface ChapterWithRelations {
  chapter: SelectChapter
  lessons: LessonListByChapterRow[]
  exercise: ExerciseListByChapterRow | null
}

/**
 * ChapterServiceDeps - ChapterService 的依赖注入接口
 * 
 * 使用依赖注入的原因：
 * ==================
 * 1. **可测试性**：测试时可以注入 Mock Repository
 * 2. **灵活性**：可以替换不同的 Repository 实现
 */
export interface ChapterServiceDeps {
  chapters?: ChapterRepository
  lessons?: LessonRepository
  exercises?: ExerciseRepository
  courses?: CourseRepository
}

/**
 * ChapterService 类 - 章节业务逻辑服务
 * 
 * 使用场景：
 * ========
 * - DatabaseSource 委托获取页面数据
 * - Admin 后台（已删除，保留接口）
 * - 其他需要章节业务逻辑的模块
 */
export class ChapterService {
  /** 章节 Repository */
  chapters: ChapterRepository
  /** 课时 Repository */
  lessons: LessonRepository
  /** 练习 Repository */
  exercises: ExerciseRepository
  /** 课程 Repository */
  courses: CourseRepository

  /**
   * 构造函数 - 使用依赖注入模式
   * 
   * @param deps 依赖项，包含四个 Repository 的可选实例
   */
  constructor({
    chapters = chapterRepository,
    lessons = lessonRepository,
    exercises = exerciseRepository,
    courses = courseRepository
  }: ChapterServiceDeps = {}) {
    this.chapters = chapters
    this.lessons = lessons
    this.exercises = exercises
    this.courses = courses
  }

  /**
   * 获取章节列表（可选按课程过滤）
   * 
   * @param courseSlug 课程的唯一标识（可选）
   * @returns Promise<ChapterListByCourseRow[] | SelectChapter[]>
   */
  async list(courseSlug?: string): Promise<ChapterListByCourseRow[] | SelectChapter[]> {
    const q = queries.normalizeListChapters(courseSlug || {})
    if (!courseSlug) return this.chapters.list()
    return this.chapters.listByCourse(q.courseSlug || courseSlug)
  }

  /**
   * 根据 slug 获取章节（包含关联数据）
   * 
   * 实现逻辑：
   * ========
   * 1. 参数规范化
   * 2. 获取章节基本信息
   * 3. 获取关联的课时列表
   * 4. 获取关联的练习
   * 
   * @param slug 章节的唯一标识
   * @returns Promise<ChapterWithRelations | null>
   */
  async getBySlug(slug: string): Promise<ChapterWithRelations | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    
    const chapter = await this.chapters.getBySlug(q.slug)
    if (!chapter) return null
    
    const lessons = await this.lessons.listByChapter(q.slug)
    const exercise = await this.exercises.getOneByChapter(q.slug)
    
    return {
      chapter,
      lessons,
      exercise: exercise || null
    }
  }

  /**
   * 获取所有章节列表
   * 
   * @returns Promise<SelectChapter[]>
   */
  async listAll(): Promise<SelectChapter[]> {
    return this.chapters.list()
  }

  /**
   * 获取章节页面的完整数据
   * 
   * 页面数据包含：
   * ============
   * - chapter: 当前章节
   * - course: 所属课程
   * - lessons: 章节下的课时列表
   * - exercise: 章节下的练习（可选）
   * - previousChapter: 上一章节
   * - nextChapter: 下一章节
   * 
   * 实现逻辑：
   * ========
   * 1. 参数规范化
   * 2. 获取章节基本信息
   * 3. 获取所属课程
   * 4. 获取关联的课时和练习
   * 5. 获取课程下所有章节，计算上一/下一章节
   * 
   * 性能注意：
   * ========
   * 此方法会产生多个数据库查询（章节、课程、课时、练习、章节列表），
   * 在生产环境中建议添加缓存优化。
   * 
   * @param slug 章节的唯一标识
   * @returns Promise<{ chapter, course, lessons, exercise, previousChapter, nextChapter } | null>
   */
  async getChapterPage(slug: string): Promise<{
    chapter: SelectChapter
    course: Course | null
    lessons: SelectLesson[]
    exercise: SelectExercise | null
    previousChapter: SelectChapter | null
    nextChapter: SelectChapter | null
  } | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null

    const chapter = await this.chapters.getBySlug(q.slug)
    if (!chapter) return null

    let course: Course | null = null
    let previousChapter: SelectChapter | null = null
    let nextChapter: SelectChapter | null = null

    // 获取所属课程
    if (chapter.courseId) {
      course = (await this.courses.getById(chapter.courseId)) || null
    }
    if (!course && chapter.course) {
      course = (await this.courses.getBySlug(chapter.course)) || null
    }

    // 获取关联的课时和练习
    const lessons = await this.lessons.listByChapter(chapter.slug)
    const exercise = await this.exercises.getOneByChapter(chapter.slug)

    // 计算上一/下一章节
    if (course) {
      const chaptersInCourse = await this.chapters.listByCourse(course.slug)
      const currentIndex = chaptersInCourse.findIndex(c => c.slug === chapter.slug)

      if (currentIndex >= 0) {
        // 获取上一章节
        if (currentIndex > 0) {
          const prevItem = chaptersInCourse[currentIndex - 1]
          if (prevItem) {
            const prev = await this.chapters.getBySlug(prevItem.slug)
            if (prev) previousChapter = prev
          }
        }
        // 获取下一章节
        if (currentIndex < chaptersInCourse.length - 1) {
          const nextItem = chaptersInCourse[currentIndex + 1]
          if (nextItem) {
            const next = await this.chapters.getBySlug(nextItem.slug)
            if (next) nextChapter = next
          }
        }
      }
    }

    return {
      chapter,
      course,
      lessons: lessons as unknown as SelectLesson[],
      exercise: (exercise || null) as unknown as SelectExercise | null,
      previousChapter,
      nextChapter
    }
  }
}

/**
 * ChapterService 单例实例
 * 
 * 使用方式：
 * ========
 * import { chapterService } from '@ce'
 * const page = await chapterService.getChapterPage('intro')
 */
export const chapterService = new ChapterService()
export default chapterService
