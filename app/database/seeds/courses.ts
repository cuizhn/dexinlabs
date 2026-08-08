/**
 * 课程 Seed 数据
 *
 * 架构 V4（定稿）：courses 表精简为 id/slug/title。
 */
import type { courses } from '../schema'

export const courseSeeds = [
  { slug: 'mathematics', title: '数学' }
] satisfies typeof courses.$inferInsert[]
