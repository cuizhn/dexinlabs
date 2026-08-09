import type { Topic } from '../topic/types'

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
