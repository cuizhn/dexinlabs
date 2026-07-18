/**
 * Content Engine 模型定义 - 领域实体类型
 * 
 * 设计意图：
 * =========
 * 定义内容系统的核心数据结构，作为 FileSource 和 DatabaseSource 的统一返回类型。
 * 
 * 为什么这样设计？
 * ===============
 * 1. **统一数据模型**：无论数据来自文件还是数据库，都使用相同的类型定义
 * 2. **类型安全**：通过 TypeScript 确保数据结构的一致性
 * 3. **可扩展性**：实体类型继承自 BaseContentEntity，便于添加通用字段
 * 
 * 替代方案对比：
 * =============
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | **接口定义** | 灵活，支持多态 | 无运行时类型检查 |
 * | 类定义 | 支持方法和继承 | 过于沉重，序列化开销大 |
 * | 联合类型 | 精确匹配 | 复杂，维护成本高 |
 * 
 * 本方案优势：
 * ===========
 * - **轻量**：接口定义，无运行时开销
 * - **灵活**：支持可选字段和扩展字段
 * - **一致**：与数据库 Schema 和文件解析结果保持一致
 */

/**
 * BaseContentEntity - 所有内容实体的基类接口
 * 
 * 设计意图：
 * =========
 * 提取所有内容实体的通用字段，避免重复定义。
 * 
 * 字段说明：
 * =========
 * - id: 数据库主键（文件系统返回 null）
 * - slug: URL 友好的唯一标识
 * - title: 显示名称
 * - summary: 摘要描述
 * - order: 排序序号
 * - createdAt/updatedAt: 时间戳
 * - [key: string]: 支持扩展字段
 */
export interface BaseContentEntity {
  id: number | null
  slug: string
  title: string
  summary?: string | null
  order: number
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  [key: string]: unknown
}

/**
 * Course - 课程实体
 * 
 * 字段说明：
 * =========
 * - cover: 封面图片 URL
 * - edition: 版本号（如 "v1.0"）
 * - body: 课程介绍正文（Markdown）
 * - chapters: 关联的章节列表（可选，按需加载）
 */
export interface Course extends BaseContentEntity {
  cover?: string | null
  edition?: string | null
  body?: string | null
  chapters?: Chapter[]
}

/**
 * Chapter - 章节实体
 * 
 * 字段说明：
 * =========
 * - course: 所属课程的 slug
 * - courseId: 所属课程的数据库 ID
 * - cover: 封面图片 URL
 * - body: 章节介绍正文（Markdown）
 * - lessons: 关联的课时列表（可选，按需加载）
 * - exercises: 关联的练习列表（可选，按需加载）
 */
export interface Chapter extends BaseContentEntity {
  course?: string | null
  courseId?: number | null
  cover?: string | null
  body?: string | null
  lessons?: Lesson[]
  exercises?: Exercise[]
}

/**
 * Lesson - 课时实体
 * 
 * 字段说明：
 * =========
 * - chapter: 所属章节的 slug
 * - chapterId: 所属章节的数据库 ID
 * - objectives: 学习目标（Markdown）
 * - intro: 引言部分（Markdown）
 * - body: 课时正文（Markdown）
 * - summaryText: 总结文本（Markdown）
 * - notes: 笔记/提示（Markdown）
 */
export interface Lesson extends BaseContentEntity {
  chapter?: string | null
  chapterId?: number | null
  objectives?: string | null
  intro?: string | null
  body?: string | null
  summaryText?: string | null
  notes?: string | null
}

/**
 * Exercise - 练习实体
 * 
 * 字段说明：
 * =========
 * - description: 题目描述（Markdown）
 * - body: 题目正文（Markdown）
 * - chapter: 所属章节的 slug
 * - chapterId: 所属章节的数据库 ID
 * - hint: 提示（Markdown）
 * - answer: 答案（Markdown）
 * - analysis: 解析（Markdown）
 */
export interface Exercise extends BaseContentEntity {
  description?: string | null
  body?: string | null
  chapter?: string | null
  chapterId?: number | null
  hint?: string | null
  answer?: string | null
  analysis?: string | null
}

/**
 * Asset - 资源实体（图片、文件等）
 * 
 * 字段说明：
 * =========
 * - type: 资源类型（如 "image", "video", "file"）
 * - url: 资源访问 URL
 * - mime: MIME 类型
 * - size: 文件大小（字节）
 * - meta: 元数据（JSON 字符串）
 */
export interface Asset {
  id: number | null
  slug: string
  title: string
  summary?: string | null
  type: string
  url: string
  mime?: string | null
  size?: number | null
  meta?: string | null
  order?: number
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  [key: string]: unknown
}

/**
 * ChapterListOptions - 章节列表查询选项
 */
export interface ChapterListOptions {
  course?: string | null
  courseSlug?: string | null
  limit?: number
  offset?: number
  orderBy?: 'id' | 'order' | string
  order?: 'asc' | 'desc'
  [key: string]: unknown
}

/**
 * LessonPage - 课时页面数据结构
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
 */
export interface CoursePage {
  course: Course
  chapters: Chapter[]
}
