/**
 * Content Engine DTO（Data Transfer Object）- 页面级数据结构
 * 
 * 设计意图：
 * =========
 * 定义页面级别的组合数据结构，将多个关联实体打包为单个响应对象。
 * 
 * 为什么需要 DTO？
 * ===============
 * 1. **减少请求次数**：一个 API 请求返回完整的页面数据，无需多次请求
 * 2. **数据一致性**：确保页面显示的关联数据来自同一次查询
 * 3. **简化前端处理**：前端只需处理一个响应对象
 * 
 * DTO vs Model 的区别：
 * ===================
 * - Model: 单个实体的数据结构（如 Course、Chapter）
 * - DTO: 多个实体的组合，用于特定页面（如 LessonPage、ChapterPage）
 * 
 * 替代方案对比：
 * =============
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | **DTO** | 减少请求，数据一致 | 增加代码量 |
 * | 多次请求 | 简单直接 | 请求频繁，数据可能不一致 |
 * | GraphQL | 灵活 | 学习曲线高，配置复杂 |
 * 
 * 本方案优势：
 * ===========
 * - **性能优化**：N+1 查询问题在后端解决
 * - **类型安全**：通过 TypeScript 确保数据结构的正确性
 * - **简单易用**：RESTful API，前端处理直观
 */
import type { Course, Chapter, Lesson, Exercise } from '../models/index'

/**
 * LessonPage - 课时页面数据结构
 * 
 * 用途：
 * =====
 * 用于课时详情页，包含课时及其上下文信息。
 * 
 * 字段说明：
 * =========
 * - lesson: 当前课时
 * - chapter: 所属章节（可能为 null，如课时未关联章节）
 * - course: 所属课程（可能为 null，如章节未关联课程）
 * - previousLesson: 上一课时（用于导航）
 * - nextLesson: 下一课时（用于导航）
 */
export interface LessonPage {
  lesson: Lesson
  chapter: Chapter | null
  course: Course | null
  previousLesson: Lesson | null
  nextLesson: Lesson | null
}

/**
 * ChapterPage - 章节页面数据结构
 * 
 * 用途：
 * =====
 * 用于章节详情页，包含章节及其关联内容。
 * 
 * 字段说明：
 * =========
 * - chapter: 当前章节
 * - course: 所属课程（可能为 null）
 * - lessons: 章节下的课时列表
 * - exercise: 章节关联的练习（可能为 null）
 * - previousChapter: 上一章节（用于导航）
 * - nextChapter: 下一章节（用于导航）
 */
export interface ChapterPage {
  chapter: Chapter
  course: Course | null
  lessons: Lesson[]
  exercise: Exercise | null
  previousChapter: Chapter | null
  nextChapter: Chapter | null
}

/**
 * CoursePage - 课程页面数据结构
 * 
 * 用途：
 * =====
 * 用于课程详情页，包含课程及其章节树。
 * 
 * 字段说明：
 * =========
 * - course: 当前课程
 * - chapters: 课程下的章节列表（包含课时）
 */
export interface CoursePage {
  course: Course
  chapters: Chapter[]
}
