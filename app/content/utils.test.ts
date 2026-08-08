import { describe, it, expect } from 'vitest'
import {
  normalizeSlug,
  toCourse,
  toTopic,
  toChapter,
  toLesson,
  toExercise,
  getSiblings
} from './utils'

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

describe('toCourse', () => {
  it('提取 Course 字段（id/slug/title），忽略多余字段', () => {
    const row = { id: 1, slug: 'mathematics', title: '数学', extra: 'ignored' }
    const result = toCourse(row)
    expect(result).toEqual({ id: 1, slug: 'mathematics', title: '数学' })
  })
})

describe('toTopic', () => {
  const row = {
    id: 1, slug: 'functions', title: '函数', order: 1,
    createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-06-01'),
    chapterList: [], lessonList: [], allTopics: []
  }

  it('提取 Topic 字段（id/slug/title/order），排除内部关联字段', () => {
    const result = toTopic(row)
    expect(result).toEqual({ id: 1, slug: 'functions', title: '函数', order: 1 })
    expect(result).not.toHaveProperty('chapterList')
    expect(result).not.toHaveProperty('lessonList')
    expect(result).not.toHaveProperty('allTopics')
  })
})

describe('toChapter', () => {
  const row = {
    id: 1, title: '函数基础', slug: 'function-basics', order: 1,
    topicId: 10,
    lessons: []
  }

  it('提取 Chapter 字段（id/title/slug/order/topicId），排除内部关联字段', () => {
    const result = toChapter(row)
    expect(result).toEqual({ id: 1, title: '函数基础', slug: 'function-basics', order: 1, topicId: 10 })
    expect(result).not.toHaveProperty('lessons')
  })
})

describe('toLesson', () => {
  const row = {
    id: 1, slug: 'what-is-function', title: '什么是函数？', order: 1,
    topicId: 5, chapterId: 3,
    content: { version: 1, blocks: [] },
    topicEntity: {}, chapterEntity: {}, siblingLessons: []
  }

  it('提取 Lesson 字段，排除内部关联字段', () => {
    const result = toLesson(row)
    expect(result.slug).toBe('what-is-function')
    expect(result.topicId).toBe(5)
    expect(result.chapterId).toBe(3)
    expect(result.content).toEqual({ version: 1, blocks: [] })
    expect(result).not.toHaveProperty('topicEntity')
    expect(result).not.toHaveProperty('chapterEntity')
    expect(result).not.toHaveProperty('siblingLessons')
  })
})

describe('toExercise', () => {
  const row = {
    id: 1, slug: 'ex-1', title: '练习一', summary: null, order: 1,
    topicId: 5,
    content: { version: 1, body: { version: 1, blocks: [] } }, astVersion: 1,
    createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-06-01')
  }

  it('提取 Exercise 字段', () => {
    const result = toExercise(row)
    expect(result.slug).toBe('ex-1')
    expect(result.topicId).toBe(5)
    expect(result.content).toEqual({ version: 1, body: { version: 1, blocks: [] } })
  })
})

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
