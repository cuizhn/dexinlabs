/**
 * Content 模块数据模型定义
 *
 * 定义知识领域、知识主题、课时、练习等核心实体的 TypeScript 接口，
 * 以及页面组合所需的扩展类型（LessonPage、TopicPage、DomainPage）。
 *
 * 架构 V2：Domain → Topic → Lesson
 */

/**
 * BaseContentEntity - 所有内容实体的基类接口
 *
 * 提取所有内容实体的通用字段，避免重复定义。
 *
 * 字段说明：
 * - id: 数据库主键
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
 * Domain - 知识领域实体（原 Course）
 *
 * 精简为分类节点，仅包含 id, slug, title, description, order。
 * Domain 不是内容实体，不需要 cover、body、edition 等展示字段。
 * topics: 关联的知识主题列表（可选，按需加载）
 */
export interface Domain extends BaseContentEntity {
  description?: string | null
  topics?: Topic[]
}

/**
 * Topic - 知识主题实体（原 Chapter）
 *
 * 字段说明：
 * - domain: 所属知识领域的 slug
 * - domainId: 所属知识领域的数据库 ID
 * - cover: 封面图片 URL
 * - body: 主题介绍正文（Markdown）
 * - lessons: 关联的课时列表（可选，按需加载）
 * - exercises: 关联的练习列表（可选，按需加载）
 */
export interface Topic extends BaseContentEntity {
  domain?: string | null
  domainId?: number | null
  cover?: string | null
  body?: string | null
  lessons?: Lesson[]
  exercises?: Exercise[]
}

/**
 * Lesson - 课时实体（最小学习单元）
 *
 * 字段说明：
 * - topic: 所属知识主题的 slug
 * - topicId: 所属知识主题的数据库 ID
 * - objectives: 学习目标（Markdown）
 * - intro: 引言部分（Markdown）
 * - body: 课时正文（Markdown）
 * - summaryText: 总结文本（Markdown）
 * - notes: 笔记/提示（Markdown）
 * - bodyHtml/introHtml/summaryHtml: 渲染后的 HTML（由 LessonService 注入）
 */
export interface Lesson extends BaseContentEntity {
  topic?: string | null
  topicId?: number | null
  objectives?: string | null
  intro?: string | null
  body?: string | null
  summaryText?: string | null
  notes?: string | null
  /** Markdown 渲染后的 HTML（由 LessonService 注入） */
  bodyHtml?: string
  /** 引言渲染后的 HTML */
  introHtml?: string
  /** 总结渲染后的 HTML */
  summaryHtml?: string
}

/**
 * Exercise - 练习实体
 *
 * 字段说明：
 * - description: 题目描述（Markdown）
 * - body: 题目正文（Markdown）
 * - topic: 所属知识主题的 slug
 * - topicId: 所属知识主题的数据库 ID
 * - hint: 提示（Markdown）
 * - answer: 答案（Markdown）
 * - analysis: 解析（Markdown）
 */
export interface Exercise extends BaseContentEntity {
  description?: string | null
  body?: string | null
  topic?: string | null
  topicId?: number | null
  hint?: string | null
  answer?: string | null
  analysis?: string | null
}

/**
 * TopicListOptions - 主题列表查询选项（原 ChapterListOptions）
 */
export interface TopicListOptions {
  domain?: string | null
  domainSlug?: string | null
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
  topic: Topic | null
  domain: Domain | null
  previousLesson: Lesson | null
  nextLesson: Lesson | null
}

/**
 * TopicPage - 知识主题页面数据结构（原 ChapterPage）
 */
export interface TopicPage {
  topic: Topic
  domain: Domain | null
  lessons: Lesson[]
  exercise: Exercise | null
  previousTopic: Topic | null
  nextTopic: Topic | null
}

/**
 * DomainPage - 知识领域页面数据结构（原 CoursePage）
 */
export interface DomainPage {
  domain: Domain
  topics: Topic[]
}
