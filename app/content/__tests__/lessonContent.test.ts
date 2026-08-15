import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { compileMarkdown } from '../../../tools/content-compiler/index.ts'
import type { Block, LessonContent } from '../../../shared/lessonAST'

function collectBlocks(blocks: Block[]): Block[] {
  const out: Block[] = []
  for (const b of blocks) {
    out.push(b)
    if (b.type === 'section') out.push(...collectBlocks(b.blocks))
  }
  return out
}

describe('真实课程内容流水线（集成）', () => {
  const lessonPath = resolve(process.cwd(), 'lessons/sets/basics/why-sets.md')
  const markdown = readFileSync(lessonPath, 'utf8')

  it('真实 .md 能编译为合法 LessonContent', () => {
    const ast: LessonContent = compileMarkdown(markdown)
    expect(ast.version).toBe(1)
    expect(ast.blocks.length).toBeGreaterThan(0)
  })

  it('真实内容不含旧的 content: string 行内 HTML 模型', () => {
    const ast = compileMarkdown(markdown)
    for (const b of collectBlocks(ast.blocks)) {
      expect((b as unknown as { content?: unknown }).content).toBeUndefined()
    }
  })

  it('编译器自动剥离 frontmatter（id/slug 等不进入 blocks）', () => {
    const ast = compileMarkdown(markdown)
    // frontmatter 的 id/slug/topic 等关键字不应作为行内文本泄漏进 Block
    const inlineText = collectBlocks(ast.blocks)
      .map(b => ('children' in b ? (b as { children: unknown[] }).children : []))
      .flat()
      .map(n => (n && typeof n === 'object' && 'value' in n ? String((n as { value: unknown }).value) : ''))
      .join(' ')
    expect(inlineText).not.toContain('slug:')
    expect(inlineText).not.toContain('topic:')
  })
})
