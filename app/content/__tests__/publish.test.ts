/**
 * Publish Service — validatePackage 纯逻辑单元测试（不连 DB，vitest）
 *
 * 覆盖 Contract 边界：
 *  - 顶层 protocol_version / ast_version 必须严格 = 1
 *  - manifest.topics 重复 slug → 失败
 *  - manifest.chapter.topic_slug 悬空 → 失败
 *  - lessons (topic_slug, slug) 重复 → 失败
 *  - lessons.content.version != ast_version → 失败
 *  - 完整合法 Mini Package → 通过
 */
import { describe, it, expect } from 'vitest'
import { validatePackage } from '@content/service/publish'
import type { ContentPackage } from '@shared/contentPackage'

/** 构造一个合法的最小 Package，供各用例 mutate */
function makeValidPkg(): ContentPackage {
  return {
    protocol_version: 1,
    ast_version: 1,
    manifest: {
      courses: [{ slug: 'junior-math', title: '初中数学' }],
      topics: [{ slug: 'topic-a', title: '主题A', order: 1 }],
      chapters: [
        { slug: 'ch-1', title: '章节1', order: 1, topic_slug: 'topic-a' }
      ]
    },
    lessons: [
      {
        slug: 'lesson-1',
        title: '课时1',
        topic_slug: 'topic-a',
        chapter_slug: 'ch-1',
        order: 1,
        content: { version: 1, blocks: [] }
      }
    ],
    exercises: []
  }
}

function expectErrors(pkg: ContentPackage, patterns: RegExp[]) {
  const r = validatePackage(pkg)
  expect(r.ok).toBe(false)
  if (r.ok) return
  patterns.forEach(p => {
    expect(r.errors.some(e => p.test(e))).toBe(true)
  })
}

describe('validatePackage — Contract 边界', () => {
  it('合法 Mini Package → 通过', () => {
    expect(validatePackage(makeValidPkg()).ok).toBe(true)
  })

  it('protocol_version 错误 → 失败', () => {
    const p = makeValidPkg()
    ;(p as any).protocol_version = 2
    expectErrors(p, [/protocol_version/])
  })

  it('ast_version 错误 → 失败', () => {
    const p = makeValidPkg()
    ;(p as any).ast_version = 0
    expectErrors(p, [/ast_version/])
  })

  it('manifest.topics 重复 slug → 失败', () => {
    const p = makeValidPkg()
    p.manifest.topics.push({ slug: 'topic-a', title: '重名', order: 2 })
    expectErrors(p, [/重复 slug.*topic-a/])
  })

  it('manifest.chapter.topic_slug 悬空 → 失败', () => {
    const p = makeValidPkg()
    p.manifest.chapters[0]!.topic_slug = 'no-such-topic'
    expectErrors(p, [/topic_slug.*不存在/])
  })

  it('manifest.chapters 组合唯一冲突 → 失败', () => {
    const p = makeValidPkg()
    p.manifest.chapters.push({
      slug: 'ch-1',
      title: '重复章节',
      order: 2,
      topic_slug: 'topic-a'
    })
    expectErrors(p, [/重复 \(topic_slug, slug\)/])
  })

  it('lessons identity 重复 → 失败', () => {
    const p = makeValidPkg()
    p.lessons.push({
      slug: 'lesson-1',
      title: '重复课时',
      topic_slug: 'topic-a',
      chapter_slug: 'ch-1',
      order: 2,
      content: { version: 1, blocks: [] }
    })
    expectErrors(p, [/lessons 重复 \(topic_slug, slug\)/])
  })

  it('lessons chapter_slug 悬空（不在 manifest.chapters）→ 失败', () => {
    const p = makeValidPkg()
    p.lessons[0]!.chapter_slug = 'ch-missing'
    expectErrors(p, [/chapter_slug=.*ch-missing.*未出现在 manifest\.chapters/])
  })

  it('lessons.content.version != ast_version → 失败', () => {
    const p = makeValidPkg()
    // 将 content.version 改到 2（必须 !== ast_version=1）
    p.lessons[0]!.content = { version: 2, blocks: [] } as any
    expectErrors(p, [/content\.version.*必须等于 ast_version = 1/])
  })

  it('lessons.content 缺失 → 失败', () => {
    const p = makeValidPkg()
    ;(p.lessons[0] as any).content = null
    expectErrors(p, [/\.content 缺失或不是对象/])
  })

  it('order 非正整数 → 失败', () => {
    const p = makeValidPkg()
    p.manifest.topics[0]!.order = 0
    p.manifest.chapters[0]!.order = -1
    p.lessons[0]!.order = 1.5
    expectErrors(p, [
      /topics\[0\].*order 必须是正整数/,
      /chapters\[0\].*order 必须是正整数/,
      /lessons\[0\].*order 必须是正整数/
    ])
  })

  it('exercises 不是数组 → 失败', () => {
    const p = makeValidPkg()
    ;(p as any).exercises = 'oops'
    expectErrors(p, [/exercises 必须是数组/])
  })

  it('exercises 非空数组 → MVP 跳过但允许（校验通过）', () => {
    const p = makeValidPkg()
    // exercises MVP 不校验内容，只要求是数组
    ;(p as any).exercises = [{ whatever: true }]
    expect(validatePackage(p).ok).toBe(true)
  })
})
