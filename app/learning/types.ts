/**
 * Learning 领域公共类型定义
 *
 * 包含跨领域共享的实体接口和转换函数。
 * 领域内部私有类型仍属于对应 Service / Repository。
 */
import type { LessonContent, ExerciseContent } from './lesson-ast'

// ────────────────────────────────────────────
// 基类接口
// ────────────────────────────────────────────

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

// ────────────────────────────────────────────
// Course
// ────────────────────────────────────────────

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

/** 从仓储查询结果中提取 Course 模型字段 */
export function toCourse(row: Record<string, unknown>): Course {
  return {
    id: row.id as number,
    slug: row.slug as string,
    title: row.title as string
  }
}

// ────────────────────────────────────────────
// Topic
// ────────────────────────────────────────────

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

/** 从仓储查询结果中提取 Topic 模型字段 */
export function toTopic(row: Record<string, unknown>): Topic {
  return {
    id: row.id as number,
    slug: row.slug as string,
    title: row.title as string,
    order: row.order as number
  }
}

// ────────────────────────────────────────────
// Chapter
// ────────────────────────────────────────────

/**
 * Chapter - 教学章节实体
 *
 * 教学组织单元，管理 Lesson 学习顺序。
 * 不参与 URL，仅用于教学组织。
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

/** 从仓储查询结果中提取 Chapter 模型字段 */
export function toChapter(row: Record<string, unknown>): Chapter {
  return {
    id: row.id as number,
    title: row.title as string,
    slug: row.slug as string,
    order: row.order as number,
    topicId: (row.topicId as number) ?? null
  }
}

// ────────────────────────────────────────────
// Lesson
// ────────────────────────────────────────────

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

/** 从仓储查询结果中提取 Lesson 模型字段 */
export function toLesson(row: Record<string, unknown>): Lesson {
  return {
    id: row.id as number,
    slug: row.slug as string,
    title: row.title as string,
    order: row.order as number,
    topicId: (row.topicId as number) ?? null,
    chapterId: (row.chapterId as number) ?? null,
    content: row.content as Lesson['content']
  }
}

// ────────────────────────────────────────────
// Exercise
// ────────────────────────────────────────────

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

/** 从仓储查询结果中提取 Exercise 模型字段 */
export function toExercise(row: Record<string, unknown>): Exercise {
  return {
    id: row.id as number,
    slug: row.slug as string,
    title: row.title as string,
    summary: (row.summary as string) ?? null,
    order: row.order as number,
    topicId: (row.topicId as number) ?? null,
    content: row.content as Exercise['content'],
    astVersion: (row.astVersion as number) ?? 1,
    createdAt: row.createdAt as Date,
    updatedAt: row.updatedAt as Date
  }
}

// ────────────────────────────────────────────
// Progress（学习进度数据模型）
// ────────────────────────────────────────────

/** LastLesson - 最近学习的课时信息 */
export interface LastLesson {
  topicSlug: string
  topicTitle: string
  lessonSlug: string
  lessonTitle: string
  lessonIndex: number
  totalLessons: number
}

/** LearningProgress - 学习进度数据 */
export interface LearningProgress {
  lastLesson: LastLesson | null
  completedLessons: string[]
  streak: {
    days: number
    lastStudyDate: string
  }
  firstVisitAt: string
}
