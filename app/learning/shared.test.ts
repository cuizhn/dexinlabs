import { describe, it, expect } from 'vitest'
import { getSiblings } from './shared'

describe('getSiblings', () => {
  const items = [
    { slug: 'a', title: 'A' },
    { slug: 'b', title: 'B' },
    { slug: 'c', title: 'C' }
  ]

  it('返回列表中前后兄弟节点', () => {
    const { previous, next } = getSiblings(items, 'b')
    expect(previous).toEqual({ slug: 'a', title: 'A' })
    expect(next).toEqual({ slug: 'c', title: 'C' })
  })

  it('第一项的 previous 为 null', () => {
    const { previous, next } = getSiblings(items, 'a')
    expect(previous).toBeNull()
    expect(next).toEqual({ slug: 'b', title: 'B' })
  })

  it('最后一项的 next 为 null', () => {
    const { previous, next } = getSiblings(items, 'c')
    expect(previous).toEqual({ slug: 'b', title: 'B' })
    expect(next).toBeNull()
  })

  it('slug 不在列表中时返回两个 null', () => {
    const { previous, next } = getSiblings(items, 'z')
    expect(previous).toBeNull()
    expect(next).toBeNull()
  })

  it('空列表返回两个 null', () => {
    const { previous, next } = getSiblings([], 'a')
    expect(previous).toBeNull()
    expect(next).toBeNull()
  })
})
