import { describe, it, expect } from 'vitest'
import { normalizeSlug } from './slug'

describe('normalizeSlug', () => {
  it('返回去除首尾空白的字符串', () => {
    expect(normalizeSlug('  hello  ')).toBe('hello')
  })

  it('空字符串返回 null', () => {
    expect(normalizeSlug('')).toBeNull()
    expect(normalizeSlug('   ')).toBeNull()
  })

  it('null / undefined 返回 null', () => {
    expect(normalizeSlug(null)).toBeNull()
    expect(normalizeSlug(undefined)).toBeNull()
  })

  it('接受含 slug 字段的对象', () => {
    expect(normalizeSlug({ slug: 'math' })).toBe('math')
    expect(normalizeSlug({ slug: '' })).toBeNull()
  })
})
