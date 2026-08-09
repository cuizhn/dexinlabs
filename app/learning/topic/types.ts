import type { BaseContentEntity } from '../shared'
import type { Chapter } from '../chapter/types'
import type { Lesson } from '../lesson/types'
import type { Exercise } from '../exercise/types'

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
