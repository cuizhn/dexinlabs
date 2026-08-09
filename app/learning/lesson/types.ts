import type { BaseContentEntity } from '../shared'
import type { LessonContent } from '../lesson-ast'

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
