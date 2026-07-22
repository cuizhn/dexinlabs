/**
 * Content 模块通用工具函数
 */
import type { Domain, Topic, Lesson, Exercise } from './models/index'

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
 * 从仓储查询结果中提取 Domain 模型字段，过滤掉内部关联字段
 *
 * Domain 是精简的分类节点，仅包含 id, slug, title, description, order。
 */
export function toDomain(row: Record<string, unknown>): Domain {
  return {
    id: row.id as number,
    slug: row.slug as string,
    title: row.title as string,
    description: (row.description as string) ?? null,
    order: row.order as number
  }
}

/**
 * 从仓储查询结果中提取 Topic 模型字段，过滤掉内部关联字段
 *
 * 仓储层的 getWithLessonsAndDomain 返回 domainEntity、lessonList、
 * exerciseEntity、siblingTopics 等内部字段，此函数将其全部排除。
 */
export function toTopic(row: Record<string, unknown>): Topic {
  return {
    id: row.id as number,
    slug: row.slug as string,
    title: row.title as string,
    summary: (row.summary as string) ?? null,
    order: row.order as number,
    domain: (row.domain as string) ?? null,
    domainId: (row.domainId as number) ?? null,
    cover: (row.cover as string) ?? null,
    body: (row.body as string) ?? null,
    createdAt: row.createdAt as Date,
    updatedAt: row.updatedAt as Date
  }
}

/**
 * 从仓储查询结果中提取 Lesson 模型字段，过滤掉内部关联字段
 *
 * 仓储层的 getWithTopicAndDomain 返回 topicEntity、domainEntity、
 * siblingLessons 等内部字段，此函数将其全部排除。
 * 可选的 extra 参数用于注入额外字段（如渲染后的 HTML）。
 */
export function toLesson(row: Record<string, unknown>, extra?: Partial<Lesson>): Lesson {
  return {
    id: row.id as number,
    slug: row.slug as string,
    title: row.title as string,
    summary: (row.summary as string) ?? null,
    order: row.order as number,
    topic: (row.topic as string) ?? null,
    topicId: (row.topicId as number) ?? null,
    objectives: (row.objectives as string) ?? null,
    intro: (row.intro as string) ?? null,
    body: (row.body as string) ?? null,
    summaryText: (row.summaryText as string) ?? null,
    notes: (row.notes as string) ?? null,
    createdAt: row.createdAt as Date,
    updatedAt: row.updatedAt as Date,
    ...extra
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
    description: (row.description as string) ?? null,
    body: (row.body as string) ?? null,
    topic: (row.topic as string) ?? null,
    topicId: (row.topicId as number) ?? null,
    hint: (row.hint as string) ?? null,
    answer: (row.answer as string) ?? null,
    analysis: (row.analysis as string) ?? null,
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
