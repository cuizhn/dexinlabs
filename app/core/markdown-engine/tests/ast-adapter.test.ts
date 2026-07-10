import {
  adapterConvertBlockTokens,
  adapterInjectMathNodes,
  buildInternalRoot
} from '../src/adapter/ast-adapter'
import type { MarkedToken } from '../src/types/parser-ast'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixturesDir = join(__dirname, 'fixtures')
function readFixture(name: string): string {
  return readFileSync(join(fixturesDir, name), 'utf-8')
}

async function test(name: string, fn: () => Promise<void> | void): Promise<void> {
  try {
    await fn()
    console.log(`  ✓ ${name}`)
  } catch (e) {
    console.error(`  ✗ ${name}`)
    console.error(`    ${e instanceof Error ? e.message : String(e)}`)
    process.exitCode = 1
  }
}
function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`Assertion failed: ${msg}`)
}

async function main() {
  console.log('=== AST Adapter Tests ===')

  await test('buildInternalRoot creates root with correct metadata', () => {
    const tokens: MarkedToken[] = [{ type: 'heading', depth: 1, text: 'Hello', tokens: [] }]
    const root = buildInternalRoot(tokens, 'Hello World', { title: 'T' }, { source: 'marked-lexer', parsedAt: 1700000000000 })
    assert(root.type === 'root', 'root type')
    assert(root.content === 'Hello World', 'content preserved')
    assert((root as any).frontmatter?.title === 'T', 'frontmatter preserved')
    assert(Array.isArray(root.children) && root.children.length > 0, 'has children')
  })

  await test('buildInternalRoot passthrough mode creates text child', () => {
    const root = buildInternalRoot([], 'Raw content', {}, { source: 'passthrough', passthrough: true })
    assert(root.type === 'root', 'root type')
    assert(root.children.length === 1, '1 child for passthrough')
    assert((root.children[0] as any)?.type === 'text', 'child is text')
    assert((root.children[0] as any)?.value === 'Raw content', 'text value preserved')
    assert((root as any).__passthrough === true, 'passthrough flag set')
  })

  await test('adapterConvertBlockTokens handles heading+paragraph+list', () => {
    const tokens: MarkedToken[] = [
      { type: 'heading', depth: 2, text: 'H2', tokens: [{ type: 'text', text: 'H2' }] },
      { type: 'paragraph', text: 'Para', tokens: [{ type: 'text', text: 'Para' }] },
      { type: 'list', ordered: true, items: [
        { type: 'list_item', tokens: [{ type: 'paragraph', text: 'A', tokens: [] }] } as MarkedToken
      ]}
    ]
    const nodes = adapterConvertBlockTokens(tokens)
    assert(nodes.length === 3, `expected 3 nodes, got ${nodes.length}`)
    assert(nodes[0]!.type === 'heading', '0 is heading')
    assert((nodes[0] as any).depth === 2, 'heading depth 2')
    assert(nodes[1]!.type === 'paragraph', '1 is paragraph')
    assert(nodes[2]!.type === 'list', '2 is list')
    assert((nodes[2] as any).ordered === true, 'list ordered true')
  })

  await test('adapterInjectMathNodes splits inline math in text', () => {
    const children: any[] = [
      { type: 'paragraph' as const, children: [
        { type: 'text' as const, value: 'Hello $x^2$ world' }
      ]}
    ]
    adapterInjectMathNodes(children)
    const para = children[0] as any
    assert(Array.isArray(para.children) && para.children.length === 3,
      `expected 3 children after math split, got ${para.children?.length}`)
    const inlineMath = para.children.find((c: any) => c.type === 'inlineMath')
    assert(inlineMath != null, 'inlineMath node exists')
    assert((inlineMath as any).value === 'x^2', 'math formula correct')
  })

  await test('math option via parseMarkdown injects math nodes (fixture math.md)', async () => {
    const md = readFixture('math.md')
    const { parseMarkdown } = await import('../src/parser/markdown')
    const ast = await parseMarkdown(md, { math: true })
    const hasMath = JSON.stringify(ast.children).includes('"type":"math"')
      || JSON.stringify(ast.children).includes('"type":"inlineMath"')
    assert(hasMath, 'math nodes injected when opts.math=true')
  })

  console.log('')
}
main().catch(e => { console.error(e); process.exit(1) })
