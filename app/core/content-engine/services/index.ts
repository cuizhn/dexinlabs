/**
 * Content Engine Services 统一导出
 * 
 * 设计意图：
 * =========
 * 作为 Service 层的统一入口（Barrel 文件），提供所有 Service 的导出。
 * 
 * 为什么需要 Barrel 文件？
 * =====================
 * 1. **统一入口**：上层代码只需从一个路径导入所有 Service
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
 * - **统一入口**：`import { courseService, chapterService } from '@ce/services'`
 * - **类型导出**：同时导出类、单例实例和类型定义
 * - **结构清晰**：每个 Service 独立文件，通过 barrel 统一导出
 * 
 * 使用方式：
 * ========
 * import {
 *   courseService,
 *   chapterService,
 *   lessonService,
 *   exerciseService
 * } from '@ce/services'
 */

/** 课程 Service 导出 */
export { CourseService, courseService } from './CourseService.js'
export type { CourseServiceDeps } from './CourseService.js'

/** 章节 Service 导出 */
export { ChapterService, chapterService } from './ChapterService.js'
export type { ChapterServiceDeps, ChapterWithRelations } from './ChapterService.js'

/** 课时 Service 导出 */
export { LessonService, lessonService } from './LessonService.js'
export type { LessonServiceDeps, LessonWithChapter } from './LessonService.js'

/** 练习 Service 导出 */
export { ExerciseService, exerciseService } from './ExerciseService.js'
export type { ExerciseServiceDeps } from './ExerciseService.js'
