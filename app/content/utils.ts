/**
 * Content 模块通用工具函数
 */

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
