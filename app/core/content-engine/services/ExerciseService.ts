/**
 * ExerciseService - 练习业务逻辑服务
 * 
 * 设计意图：
 * =========
 * 封装练习相关的业务逻辑，包括数据查询。
 * 
 * 职责边界：
 * =========
 * 1. 查询练习数据（委托给 Repository）
 * 2. 参数规范化和验证
 * 
 * 为什么需要 Service 层？
 * ====================
 * 1. **业务逻辑复用**：参数验证逻辑可以被多个地方复用
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
 * - **可复用性**：参数验证逻辑可以被多个地方调用
 * - **可测试性**：依赖注入模式便于 Mock
 */
import { exerciseRepository } from '@core/database/repositories'
import type { ExerciseRepository, ExerciseListByChapterRow } from '@core/database/repositories'
import type { Exercise } from '../models/index'
import { queries } from '../queries/index'

/** 练习查询类型别名 */
type SelectExercise = Exercise

/**
 * ExerciseServiceDeps - ExerciseService 的依赖注入接口
 * 
 * 使用依赖注入的原因：
 * ==================
 * 1. **可测试性**：测试时可以注入 Mock Repository
 * 2. **灵活性**：可以替换不同的 Repository 实现
 */
export interface ExerciseServiceDeps {
  exercises?: ExerciseRepository
}

/**
 * ExerciseService 类 - 练习业务逻辑服务
 * 
 * 使用场景：
 * ========
 * - DatabaseSource 委托获取练习数据
 * - Admin 后台（已删除，保留接口）
 * - 其他需要练习业务逻辑的模块
 */
export class ExerciseService {
  /** 练习 Repository */
  exercises: ExerciseRepository

  /**
   * 构造函数 - 使用依赖注入模式
   * 
   * @param deps 依赖项，包含练习 Repository 的可选实例
   */
  constructor({ exercises = exerciseRepository }: ExerciseServiceDeps = {}) {
    this.exercises = exercises
  }

  /**
   * 根据章节 slug 获取练习列表
   * 
   * @param chapterSlug 章节的唯一标识
   * @returns Promise<ExerciseListByChapterRow[]>
   */
  async listByChapter(chapterSlug: string): Promise<ExerciseListByChapterRow[]> {
    const q = queries.normalizeByChapter(chapterSlug)
    if (!q.isValid) return []
    return this.exercises.listByChapter(q.chapterSlug || String(chapterSlug))
  }

  /**
   * 根据 slug 获取练习
   * 
   * 实现逻辑：
   * ========
   * 1. 参数规范化
   * 2. 获取练习基本信息
   * 
   * @param slug 练习的唯一标识
   * @returns Promise<SelectExercise | null>
   */
  async getBySlug(slug: string): Promise<SelectExercise | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    return this.exercises.getBySlug(q.slug)
  }

  /**
   * 获取所有练习列表
   * 
   * @returns Promise<SelectExercise[]>
   */
  async listAll(): Promise<SelectExercise[]> {
    return this.exercises.list()
  }
}

/**
 * ExerciseService 单例实例
 * 
 * 使用方式：
 * ========
 * import { exerciseService } from '@ce'
 * const exercise = await exerciseService.getBySlug('intro-quiz')
 */
export const exerciseService = new ExerciseService()
export default exerciseService
