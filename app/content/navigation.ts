/**
 * Content 领域共享工具函数
 */

/**
 * 在有序列表中定位当前项的前后兄弟节点
 *
 * 用于主题导航（前后主题）和课时导航（前后课时）等场景。
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
