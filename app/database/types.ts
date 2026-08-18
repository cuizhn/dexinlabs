/**
 * 数据库实体类型定义
 *
 * 包含所有数据库表的实体接口和转换函数。
 */
import type { LessonContent, ExerciseContent } from '@shared/lessonAST'

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

export interface Course {
  id: number | null
  slug: string
  title: string
  topics?: Topic[]
  [key: string]: unknown
}

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

export interface Topic extends BaseContentEntity {
  chapters?: Chapter[]
  lessons?: Lesson[]
  exercises?: Exercise[]
}

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

export interface Chapter {
  id: number | null
  title: string
  slug: string
  order: number
  topicId?: number | null
  lessons?: Lesson[]
  [key: string]: unknown
}

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

export interface Lesson extends BaseContentEntity {
  topicId?: number | null
  chapterId?: number | null
  /** AST 版本号（Contract 冻结 = 1） */
  astVersion?: number | null
  content?: LessonContent | null
}

export function toLesson(row: Record<string, unknown>): Lesson {
  return {
    id: row.id as number,
    slug: row.slug as string,
    title: row.title as string,
    order: row.order as number,
    topicId: (row.topicId as number) ?? null,
    chapterId: (row.chapterId as number) ?? null,
    astVersion: (row.astVersion as number) ?? null,
    content: row.content as Lesson['content']
  }
}

// ────────────────────────────────────────────
// Exercise
// ────────────────────────────────────────────

export interface Exercise extends BaseContentEntity {
  topicId?: number | null
  content?: ExerciseContent | null
  astVersion?: number
}

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
