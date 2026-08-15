import { describe, it, expect } from 'vitest'
import { compileMarkdown } from '../../../tools/content-compiler/index.ts'
import type { Block, LessonContent, Inline } from '../../../shared/lessonAST'

// 辅助：深度收集所有文本类 Block 的 children，断言不存在旧的 `content: string`(行内 HTML) 模型
function collectBlocks(blocks: Block[]): Block[] {
  const out: Block[] = []
  for (const b of blocks) {
    out.push(b)
    if (b.type === 'section') out.push(...collectBlocks(b.blocks))
  }
  return out
}

function inlineTypes(nodes: Inline[]): string[] {
  return nodes.map(n => n.type)
}

describe('compileMarkdown — Lesson AST 契约', () => {
  it('返回顶层 { version: 1, blocks: Block[] }', () => {
    const ast = compileMarkdown('# 标题\n\n正文')
    expect(ast.version).toBe(1)
    expect(Array.isArray(ast.blocks)).toBe(true)
  })

  it('跳过首个 H1 标题，后续作为 Block', () => {
    const ast = compileMarkdown('# 页面标题\n\n第一段内容')
    // H1 被跳过，第一段成为 blocks[0]
    expect(ast.blocks).toHaveLength(1)
    expect(ast.blocks[0]!.type).toBe('paragraph')
  })

  it('文本块使用 children: Inline[]（语义模型，非 content: string）', () => {
    const ast = compileMarkdown('# T\n\n这是 **加粗** 与 *斜体* 以及 `代码` 文本')
    const para = ast.blocks[0] as Extract<Block, { type: 'paragraph' }>
    expect(para.type).toBe('paragraph')
    // 关键断言：文本块不得是旧的行内 HTML 字符串模型
    expect((para as unknown as { content?: unknown }).content).toBeUndefined()
    expect(Array.isArray(para.children)).toBe(true)
    const types = inlineTypes(para.children)
    expect(types).toContain('bold')
    expect(types).toContain('italic')
    expect(types).toContain('code')
  })

  it('行内链接与行内公式编译为 link / math Inline', () => {
    const ast = compileMarkdown('# T\n\n参见 [集合论](https://example.com) 与公式 $E=mc^2$ 的应用')
    const para = ast.blocks[0] as Extract<Block, { type: 'paragraph' }>
    const types = inlineTypes(para.children)
    expect(types).toContain('link')
    expect(types).toContain('math')
    const link = para.children.find(n => n.type === 'link') as Extract<Inline, { type: 'link' }>
    expect(link.url).toBe('https://example.com')
  })

  it('## 标题生成可嵌套的 SectionBlock，title 为 Inline[]', () => {
    const ast = compileMarkdown('# T\n\n## 基本概念\n\n这是分区下的段落')
    const section = ast.blocks[0] as Extract<Block, { type: 'section' }>
    expect(section.type).toBe('section')
    expect(Array.isArray(section.title)).toBe(true)
    expect(section.title[0]!.type).toBe('text')
    expect(section.blocks).toHaveLength(1)
    expect(section.blocks[0]!.type).toBe('paragraph')
  })

  it(':::hint 容器生成 HintBlock，默认 level=info，children 为 Inline[]', () => {
    const ast = compileMarkdown('# T\n\n:::hint\n这是一条提示\n:::')
    const hint = ast.blocks.find(b => b.type === 'hint') as Extract<Block, { type: 'hint' }>
    expect(hint).toBeTruthy()
    expect(hint.level).toBe('info')
    expect(Array.isArray(hint.children)).toBe(true)
  })

  it(':::definition 容器生成 DefinitionBlock（term + children）', () => {
    const ast = compileMarkdown('# T\n\n:::definition{term="集合"}\n确定性对象的总体。\n:::')
    const def = ast.blocks.find(b => b.type === 'definition') as Extract<Block, { type: 'definition' }>
    expect(def).toBeTruthy()
    expect(def.term).toBe('集合')
    expect(Array.isArray(def.children)).toBe(true)
  })

  it('块级公式 $$...$$ 生成 FormulaBlock（display: true）', () => {
    const ast = compileMarkdown('# T\n\n$$\na^2 + b^2 = c^2\n$$\n')
    const formula = ast.blocks.find(b => b.type === 'formula') as Extract<Block, { type: 'formula' }>
    expect(formula).toBeTruthy()
    expect(formula.display).toBe(true)
    expect(formula.latex).toContain('a^2 + b^2')
  })

  it('无序列表生成 ListBlock，items 为 Inline[][]', () => {
    const ast = compileMarkdown('# T\n\n- 第一项\n- 第二项')
    const list = ast.blocks.find(b => b.type === 'list') as Extract<Block, { type: 'list' }>
    expect(list).toBeTruthy()
    expect(list.ordered).toBe(false)
    expect(list.items).toHaveLength(2)
    expect(Array.isArray(list.items[0])).toBe(true)
  })

  it('整条链路不使用旧的 content: string 行内 HTML 模型', () => {
    const ast: LessonContent = compileMarkdown(
      '# 标题\n\n## 分区\n\n段落 **x**\n\n:::hint\n提示\n:::\n\n$$\n1+1=2\n$$\n\n- a\n'
    )
    const all = collectBlocks(ast.blocks)
    for (const b of all) {
      // 任何 Block 都不应携带旧的 `content` 字符串字段（除 CodeBlock 的 code / FormulaBlock 的 latex 这类合法字段）
      expect((b as unknown as { content?: unknown }).content).toBeUndefined()
    }
    // 至少覆盖 paragraph / section / hint / formula / list 五种
    const types = all.map(b => b.type)
    expect(types).toContain('paragraph')
    expect(types).toContain('section')
    expect(types).toContain('hint')
    expect(types).toContain('formula')
    expect(types).toContain('list')
  })
})
