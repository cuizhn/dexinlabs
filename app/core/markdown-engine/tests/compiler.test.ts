import { compileToRenderTree } from '../src/compiler/index'
import { renderTreeToHTML } from '../src/adapters/htmlAdapter'
import { renderTreeToVNode } from '../src/adapters/vnodeAdapter'
import { createEngine, parseMarkdown } from '../src/index'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

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
  console.log('=== Compiler & Adapter Tests ===')

  await test('compileToRenderTree returns PascalCase RenderRoot with Heading/Paragraph', async () => {
    const ast = await parseMarkdown('# Hello\n\nWorld paragraph')
    const tree = compileToRenderTree(ast as any, { theme: 'default' })
    assert(tree.type === 'Root', `root type, got ${tree.type}`)
    assert(tree.props?.theme === 'default', 'theme in root props')
    assert(Array.isArray(tree.children) && tree.children.length === 2,
      `2 children, got ${tree.children?.length}`)
    const heading = tree.children[0]!
    assert(heading.type === 'Heading', `0 is Heading, got ${heading.type}`)
    assert((heading.props?.level as any) === 1, 'heading level 1')
    assert(tree.children[1]!.type === 'Paragraph', '1 is Paragraph')
  })

  await test('Heading props.id preserved from Transformer heading ID inject', async () => {
    const engine = createEngine()
    const md = '# Heading ID Test\n\nContent'
    const compiled = await engine.compile(md)
    assert(compiled.enhancedAST != null, 'enhancedAST present')
    const tree = compileToRenderTree(compiled.enhancedAST as any, {})
    const heading = tree.children.find(n => n.type === 'Heading')
    assert(heading != null, 'has Heading')
    assert(typeof heading?.props?.id === 'string' && heading.props.id.length > 0,
      `heading id injected via transformer, got: ${String(heading?.props?.id ?? 'EMPTY')}`)
  })

  await test('htmlAdapter produces <h1>/<p> HTML tags', async () => {
    const ast = await parseMarkdown('# Hello\n\nPara')
    const tree = compileToRenderTree(ast as any, {})
    const html = renderTreeToHTML(tree, {})
    assert(typeof html === 'string' && html.length > 0, 'html is non-empty string')
    assert(html.includes('<h1') && html.includes('Hello'), 'has h1 with Hello')
    assert(html.includes('<p>') && html.includes('Para'), 'has p with Para')
  })

  await test('vnodeAdapter returns VNode structure matching legacy vnodeRenderer output', async () => {
    const engine = createEngine()
    const md = readFixture('basic.md')
    const vnode = await engine.render(md, { target: 'vnode' }) as Record<string, unknown> | null
    assert(vnode !== null, 'vnode not null')
    assert(vnode?.type === 'root', 'vnode root type (legacy compat)')
    assert(vnode?.is === 'div', 'vnode is=div (legacy compat)')
    const cls = (vnode?.props as Record<string, unknown>)?.class as string[]
    assert(Array.isArray(cls) && cls.includes('ce-markdown'), 'ce-markdown class present')
    assert(Array.isArray(vnode?.children), 'children array exists')
  })

  await test('compile returns both html & vnode (full Pipeline 8-step)', async () => {
    const engine = createEngine()
    const md = readFixture('basic.md')
    const result = await engine.compile(md)
    assert(typeof result.html === 'string' && result.html.length > 0, 'html exists')
    assert(result.html.includes('<h1'), 'html has h1')
    assert(result.vnode != null, 'vnode exists')
    assert((result.vnode as Record<string, unknown>).type === 'root', 'vnode root type')
    assert(result.errors.length === 0, '0 errors')
  })

  console.log('')
}
main().catch(e => { console.error(e); process.exit(1) })
