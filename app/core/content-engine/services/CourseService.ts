/**
 * CourseService - 课程业务逻辑服务
 * 
 * 设计意图：
 * =========
 * 封装课程相关的业务逻辑，包括数据查询和页面聚合。
 * 
 * 职责边界：
 * =========
 * 1. 查询课程数据（委托给 Repository）
 * 2. 构建页面级数据（CoursePage）
 * 3. 处理关联数据（章节、课时的嵌套聚合）
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
 * - **可复用性**：getCoursePage 方法可以被多个地方调用
 * - **可测试性**：依赖注入模式便于 Mock
 */
import {
  courseRepository,
  chapterRepository,
  lessonRepository
} from '@core/database/repositories'
import type { CourseRepository } from '@core/database/repositories'
import type { ChapterRepository, ChapterListByCourseRow } from '@core/database/repositories'
import type { LessonRepository, LessonListByChapterRow } from '@core/database/repositories'
import type { Course, Chapter, Lesson } from '../models/index'
import { queries } from '../queries/index'

/** 课程查询类型别名 */
type SelectCourse = Course
/** 章节查询类型别名 */
type SelectChapter = Chapter
/** 课时查询类型别名 */
type SelectLesson = Lesson

/**
 * ChapterWithLessons - 包含课时列表的章节
 * 
 * 设计意图：
 * =========
 * 在章节列表行基础上增加课时列表，用于构建课程的完整目录结构。
 */
interface ChapterWithLessons extends ChapterListByCourseRow {
  lessons: (LessonListByChapterRow & { [key: string]: unknown })[]
}

/**
 * CourseWithChapters - 包含章节和课时的课程
 * 
 * 设计意图：
 * =========
 * 在基础课程信息上增加完整的章节树结构（包含课时），便于页面渲染。
 */
type CourseWithChapters = SelectCourse & {
  chapters: ChapterWithLessons[]
}

/**
 * CourseServiceDeps - CourseService 的依赖注入接口
 * 
 * 使用依赖注入的原因：
 * ==================
 * 1. **可测试性**：测试时可以注入 Mock Repository
 * 2. **灵活性**：可以替换不同的 Repository 实现
 */
export interface CourseServiceDeps {
  courses?: CourseRepository
  chapters?: ChapterRepository
  lessons?: LessonRepository
}

/**
 * CourseService 类 - 课程业务逻辑服务
 * 
 * 使用场景：
 * ========
 * - DatabaseSource 委托获取页面数据
 * - Admin 后台（已删除，保留接口）
 * - 其他需要课程业务逻辑的模块
 */
export class CourseService {
  /** 课程 Repository */
  courses: CourseRepository
  /** 章节 Repository */
  chapters: ChapterRepository
  /** 课时 Repository */
  lessons: LessonRepository

  /**
   * 构造函数 - 使用依赖注入模式
   * 
   * @param deps 依赖项，包含三个 Repository 的可选实例
   */
  constructor({ courses = courseRepository, chapters = chapterRepository, lessons = lessonRepository }: CourseServiceDeps = {}) {
    this.courses = courses
    this.chapters = chapters
    this.lessons = lessons
  }

  /**
   * 获取所有课程列表
   * 
   * @returns Promise<SelectCourse[]>
   */
  async list(): Promise<SelectCourse[]> {
    return this.courses.list()
  }

  /**
   * 获取默认课程（包含章节和课时）
   * 
   * 实现逻辑：
   * ========
   * 1. 获取默认课程基本信息
   * 2. 获取课程下所有章节
   * 3. 遍历每个章节，获取章节下的课时
   * 4. 组装成完整的课程数据结构
   * 
   * 性能注意：
   * ========
   * 此方法会产生 N+1 查询问题（1 个课程查询 + N 个章节查询 + M 个课时查询），
   * 在生产环境中建议添加缓存优化或使用批量查询。
   * 
   * @returns Promise<CourseWithChapters | null>
   */
  async getDefault(): Promise<CourseWithChapters | null> {
    const course = await this.courses.getDefault()
    if (!course) return null
    
    const chapters = await this.chapters.listByCourse(course.slug)
    const chaptersAggregated: ChapterWithLessons[] = []
    
    for (const chapter of chapters) {
      const lessons = await this.lessons.listByChapter(chapter.slug)
      chaptersAggregated.push({ ...chapter, lessons: lessons as unknown as ChapterWithLessons['lessons'] })
    }
    
    return { ...course, chapters: chaptersAggregated } as unknown as CourseWithChapters
  }

  /**
   * 根据 slug 获取课程（包含章节和课时）
   * 
   * 实现逻辑：
   * ========
   * 1. 参数规范化
   * 2. 获取课程基本信息
   * 3. 获取课程下所有章节
   * 4. 遍历每个章节，获取章节下的课时
   * 5. 组装成完整的课程数据结构
   * 
   * 性能注意：
   * ========
   * 此方法会产生 N+1 查询问题，在生产环境中建议添加缓存优化。
   * 
   * @param slug 课程的唯一标识
   * @returns Promise<CourseWithChapters | null>
   */
  async getBySlug(slug: string): Promise<CourseWithChapters | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    
    const course = await this.courses.getBySlug(q.slug)
    if (!course) return null
    
    const chapters = await this.chapters.listByCourse(course.slug)
    const chaptersAggregated: ChapterWithLessons[] = []
    
    for (const chapter of chapters) {
      const lessons = await this.lessons.listByChapter(chapter.slug)
      chaptersAggregated.push({ ...chapter, lessons: lessons as unknown as ChapterWithLessons['lessons'] })
    }
    
    return { ...course, chapters: chaptersAggregated } as unknown as CourseWithChapters
  }

  /**
   * 获取课程页面的完整数据
   * 
   * 页面数据包含：
   * ============
   * - course: 当前课程
   * - chapters: 课程下的章节列表（包含课时）
   * 
   * 实现说明：
   * ========
   * 此方法实际上是 getBySlug 的别名，为了保持接口一致性而存在。
   * 
   * @param slug 课程的唯一标识
   * @returns Promise<{ course, chapters } | null>
   */
  async getCoursePage(slug: string): Promise<{
    course: SelectCourse
    chapters: ChapterWithLessons[]
  } | null> {
    return this.getBySlug(slug) as unknown as { course: SelectCourse; chapters: ChapterWithLessons[] } | null
  }
}

/**
 * CourseService 单例实例
 * 
 * 使用方式：
 * ========
 * import { courseService } from '@ce'
 * const page = await courseService.getCoursePage('intro')
 */
export const courseService = new CourseService()
export default courseService
