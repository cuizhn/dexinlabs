/**
 * Learning 领域共享类型与工具
 *
 * 包含跨领域共享的基类接口和通用工具函数。
 */

/**
 * BaseContentEntity - 部分内容实体的基类接口
 *
 * Topic、Lesson、Exercise 共用此基类。
 * Course 已精简为 id/slug/title，不使用此基类。
 */
export interface BaseContentEntity {
  id: number | null
  slug: string
  title: string
  summary?: string | null
  order: number
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  [key: string]: unknown
}

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
