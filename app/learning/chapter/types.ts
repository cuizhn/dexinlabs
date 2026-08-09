import type { Lesson } from '../lesson/types'

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
