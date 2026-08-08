/**
 * Content 模块类型定义
 *
 * 定义课程、知识主题、教学章节、课时、练习等核心实体的 TypeScript 接口，
 * 以及页面组合所需的扩展类型（LessonPage、TopicPage、CoursePage）。
 *
 * 架构 V4（定稿）：Course → Topic → Chapter → Lesson
 */

import type { LessonContent, ExerciseContent } from './ast'

/**
 * BaseContentEntity - 部分内容实体的基类接口
 *
 * Topic、Lesson、Exercise 共用此基类。
 * Course 已精简为 id/slug/title，不使用此基类。
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
 * 只保留核心字段：id, slug, title。
 * 对应数据库 courses 表。
 */
export interface Course {
  id: number | null
  slug: string
  title: string
  topics?: Topic[]
  [key: string]: unknown
}

/**
 * Topic - 知识主题实体
 *
 * 只保留核心字段：id, slug, title, order。
 * 不再有 courseId、description、cover、body 等字段。
 */
export interface Topic extends BaseContentEntity {
  chapters?: Chapter[]
  lessons?: Lesson[]
  exercises?: Exercise[]
}

/**
 * Chapter - 教学章节实体
 *
 * 教学组织单元，管理 Lesson 学习顺序。
 * 不参与 URL，仅用于教学组织。
 * 新增 slug 字段用于内部标识。
 */
export interface Chapter {
  id: number | null
  title: string
  slug: string
  order: number
  topicId?: number | null
  lessons?: Lesson[]
  [key: string]: unknown
}

/**
 * Lesson - 课时实体（最小学习单元）
 *
 * 同时具有知识归属（topicId）和教学归属（chapterId）。
 * 不再有 summary、astVersion 等字段。
 */
export interface Lesson extends BaseContentEntity {
  topicId?: number | null
  chapterId?: number | null
  /** Lesson AST 结构化内容 */
  content?: LessonContent | null
}

/**
 * Exercise - 练习实体
 *
 * 字段说明：
 * - topicId: 所属知识主题的数据库 ID
 * - content: ExerciseContent AST 结构化内容
 * - astVersion: AST 版本号（当前为 1）
 */
export interface Exercise extends BaseContentEntity {
  topicId?: number | null
  /** Exercise AST 结构化内容 */
  content?: ExerciseContent | null
  /** AST 版本号 */
  astVersion?: number
}

/**
 * LessonPage - 课时页面数据结构
 */
export interface LessonPage {
  lesson: Lesson
  topic: Topic | null
  course: Course | null
  chapter: Chapter | null
  previousLesson: Lesson | null
  nextLesson: Lesson | null
}

/**
 * TopicPage - 知识主题页面数据结构
 *
 * 包含主题下的章节列表（含各章节的课时），
 * 以及不属于任何章节的课时（flatLessons）。
 */
export interface TopicPage {
  topic: Topic
  course: Course | null
  chapters: ChapterWithLessons[]
  lessons: Lesson[]
  exercise: Exercise | null
  previousTopic: Topic | null
  nextTopic: Topic | null
}

/**
 * ChapterWithLessons - 章节及其课时
 */
export interface ChapterWithLessons {
  chapter: Chapter
  lessons: Lesson[]
}

/**
 * CoursePage - 课程页面数据结构
 */
export interface CoursePage {
  course: Course
  topics: Topic[]
}

/**
 * ExercisePage - 练习页面数据结构
 */
export interface ExercisePage {
  exercise: Exercise | null
  topicTitle: string
}
