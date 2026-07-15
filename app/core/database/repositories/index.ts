/**
 * Database Repositories 统一导出
 * 
 * 设计意图：
 * =========
 * 作为 Repository 层的统一入口（Barrel 文件），提供所有 Repository 的导出。
 * 
 * 为什么需要 Barrel 文件？
 * =====================
 * 1. **统一入口**：上层代码只需从一个路径导入所有 Repository
 * 2. **减少导入语句**：避免重复的 import 语句
 * 3. **隐藏内部结构**：上层代码不依赖具体文件位置
 * 
 * 替代方案对比：
 * =============
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | **Barrel 文件** | 统一入口，减少重复导入 | 增加一层转发 |
 * | 直接导入具体文件 | 简单直接 | 导入语句冗长，依赖文件位置 |
 * | 集中定义所有类 | 集中管理 | 文件过大，难以维护 |
 * 
 * 本方案优势：
 * ===========
 * - **统一入口**：`import { courseRepository, chapterRepository } from '@core/database/repositories'`
 * - **类型导出**：同时导出类和类型定义
 * - **结构清晰**：每个 Repository 独立文件，通过 barrel 统一导出
 * 
 * 使用方式：
 * ========
 * import {
 *   courseRepository,
 *   chapterRepository,
 *   lessonRepository,
 *   exerciseRepository,
 *   assetRepository
 * } from '@core/database/repositories'
 */

/** 课程 Repository 导出 */
export { CourseRepository, courseRepository } from './CourseRepository'
export type { CourseListOptions } from './CourseRepository'

/** 章节 Repository 导出 */
export { ChapterRepository, chapterRepository } from './ChapterRepository'
export type {
  ChapterFilters,
  ChapterListOptions,
  ChapterListByCourseRow
} from './ChapterRepository'

/** 课时 Repository 导出 */
export { LessonRepository, lessonRepository } from './LessonRepository'
export type {
  LessonFilters,
  LessonListOptions,
  LessonListByChapterRow
} from './LessonRepository'

/** 练习 Repository 导出 */
export { ExerciseRepository, exerciseRepository } from './ExerciseRepository'
export type {
  ExerciseFilters,
  ExerciseListOptions,
  ExerciseListByChapterRow
} from './ExerciseRepository'

/** 资源 Repository 导出 */
export { AssetRepository, assetRepository } from './AssetRepository'
export type { AssetListOptions } from './AssetRepository'
