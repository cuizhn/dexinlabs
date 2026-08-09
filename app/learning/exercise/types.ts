import type { BaseContentEntity } from '../shared'
import type { ExerciseContent } from '../lesson-ast'

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
