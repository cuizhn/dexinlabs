import { describe, it, expect } from 'vitest'
import {
  normalizeSlug,
  toDomain,
  toTopic,
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

describe('toDomain', () => {
  it('提取 Domain 字段，忽略多余字段', () => {
    const row = { id: 1, slug: 'math', title: '数学', description: '描述', order: 0, extra: 'ignored' }
    const result = toDomain(row)
    expect(result).toEqual({ id: 1, slug: 'math', title: '数学', description: '描述', order: 0 })
  })

  it('description 缺失时为 null', () => {
    const row = { id: 1, slug: 'math', title: '数学', order: 0 }
    expect(toDomain(row).description).toBeNull()
  })
})

describe('toTopic', () => {
  const row = {
    id: 1, slug: 'algebra', title: '代数', summary: '摘要', order: 1,
    domain: 'math', domainId: 10, cover: '/cover.jpg', body: '# Body',
    createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-06-01'),
    domainEntity: { id: 10 }, lessonList: [], siblingTopics: []
  }

  it('提取 Topic 字段，排除内部关联字段', () => {
    const result = toTopic(row)
    expect(result.slug).toBe('algebra')
    expect(result.domain).toBe('math')
    expect(result).not.toHaveProperty('domainEntity')
    expect(result).not.toHaveProperty('lessonList')
    expect(result).not.toHaveProperty('siblingTopics')
  })

  it('可选字段缺失时为 null', () => {
    const minimal = { id: 2, slug: 'geo', title: '几何', order: 2 }
    const result = toTopic(minimal)
    expect(result.summary).toBeNull()
    expect(result.cover).toBeNull()
    expect(result.body).toBeNull()
  })
})

describe('toLesson', () => {
  const row = {
    id: 1, slug: 'lesson-1', title: '第一课', summary: '摘要', order: 1,
    topic: 'algebra', topicId: 5, objectives: '目标', intro: '引言',
    body: '正文', summaryText: '总结', notes: '笔记',
    createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-06-01'),
    topicEntity: {}, domainEntity: {}, siblingLessons: []
  }

  it('提取 Lesson 字段，排除内部关联字段', () => {
    const result = toLesson(row)
    expect(result.slug).toBe('lesson-1')
    expect(result.body).toBe('正文')
    expect(result).not.toHaveProperty('topicEntity')
    expect(result).not.toHaveProperty('siblingLessons')
  })

  it('支持 extra 参数注入额外字段', () => {
    const result = toLesson(row, { bodyHtml: '<p>正文</p>', introHtml: '<p>引言</p>' })
    expect(result.bodyHtml).toBe('<p>正文</p>')
    expect(result.introHtml).toBe('<p>引言</p>')
  })
})

describe('toExercise', () => {
  const row = {
    id: 1, slug: 'ex-1', title: '练习一', summary: null, order: 1,
    description: '题目描述', body: '题目正文', topic: 'algebra', topicId: 5,
    hint: '提示', answer: '答案', analysis: '解析',
    createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-06-01')
  }

  it('提取 Exercise 字段', () => {
    const result = toExercise(row)
    expect(result.slug).toBe('ex-1')
    expect(result.hint).toBe('提示')
    expect(result.answer).toBe('答案')
  })

  it('支持 extra 参数注入 bodyHtml', () => {
    const result = toExercise(row, { bodyHtml: '<p>题目</p>' })
    expect(result.bodyHtml).toBe('<p>题目</p>')
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
