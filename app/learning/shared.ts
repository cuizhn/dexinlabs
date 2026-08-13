/**
 * Learning 领域共享工具函数
 *
 * 仅包含跨领域共享的工具函数和通用逻辑。
 * 共享类型定义在 types.ts 中。
 */

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
