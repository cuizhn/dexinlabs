/**
 * 知识领域 Seed 数据
 *
 * 定义三大知识领域：数与代数、图形与几何、统计与概率。
 * Domain 是精简的分类节点，仅包含 slug, title, description, order。
 */
import { domains } from '../schema'

export const domainSeeds = [
  { slug: 'algebra', title: '数与代数', description: '数与代数领域的核心内容', order: 1 },
  { slug: 'geometry', title: '图形与几何', description: '图形与几何领域的核心内容', order: 2 },
  { slug: 'statistics', title: '统计与概率', description: '统计与概率领域的核心内容', order: 3 }
] satisfies typeof domains.$inferInsert[]
