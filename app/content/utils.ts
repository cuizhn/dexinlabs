/**
 * Content 模块通用工具函数
 */
import type { Course, Topic, Chapter, Lesson, Exercise } from './types/index'

/**
 * 标准化 slug 输入，去除首尾空白，空值返回 null
 *
 * @param input slug 字符串，或包含 slug 字段的对象（兼容路由参数）
 */
export function normalizeSlug(input: string | { slug: string } | null | undefined): string | null {
  const slug = typeof input === 'string' ? input : (input && typeof input === 'object' ? input.slug : '')
  const clean = String(slug || '').trim()
  return clean || null
}

/**
 * 从仓储查询结果中提取 Course 模型字段，过滤掉内部关联字段
 */
export function toCourse(row: Record<string, unknown>): Course {
  return {
    id: row.id as number,
    slug: row.slug as string,
    title: row.title as string
  }
}

/**
 * 从仓储查询结果中提取 Topic 模型字段，过滤掉内部关联字段
 */
export function toTopic(row: Record<string, unknown>): Topic {
  return {
    id: row.id as number,
    slug: row.slug as string,
    title: row.title as string,
    order: row.order as number
  }
}

/**
 * 从仓储查询结果中提取 Chapter 模型字段，过滤掉内部关联字段
 */
export function toChapter(row: Record<string, unknown>): Chapter {
  return {
    id: row.id as number,
    title: row.title as string,
    slug: row.slug as string,
    order: row.order as number,
    topicId: (row.topicId as number) ?? null
  }
}

/**
 * 从仓储查询结果中提取 Lesson 模型字段，过滤掉内部关联字段
 */
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

/**
 * 从仓储查询结果中提取 Exercise 模型字段
 */
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

/**
 * 在有序列表中定位当前项的前后兄弟节点
 *
 * 用于主题导航（前后主题）和课时导航（前后课时）等场景。
 * 通过 slug 匹配当前项，返回其在列表中的前驱和后继。
 *
 * @param items 有序列表（如所有主题或所有课时）
 * @param currentSlug 当前项的 slug
 * @returns previous 和 next 兄弟节点，不存在时为 null
 */
export function getSiblings<T extends { slug: string }>(
  items: T[],
  currentSlug: string
): { previous: T | null; next: T | null } {
  const index = items.findIndex(item => item.slug === currentSlug)
  if (index < 0) return { previous: null, next: null }
  return {
    previous: (index > 0 ? items[index - 1] : null) ?? null,
    next: (index < items.length - 1 ? items[index + 1] : null) ?? null
  }
}
