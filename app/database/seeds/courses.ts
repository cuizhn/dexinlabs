/**
 * 课程 Seed 数据
 *
 * 定义课程入口。
 * Course 包含 slug, title, description, order。
 *
 * 架构 V4：Course → Topic → Chapter → Lesson
 */
import type { courses } from '../schema'

export const courseSeeds = [
  { slug: 'math', title: '数学', description: '数学课程', order: 1 }
] satisfies typeof courses.$inferInsert[]
