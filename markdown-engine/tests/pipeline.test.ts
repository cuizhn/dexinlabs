import { createEngine } from '../src/index'
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

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Assertion failed: ${message}`)
}

async function main() {
  console.log('=== Pipeline Tests ===')

  const engine = createEngine()

  await test('engine has 6 builtin plugins', () => {
    const plugins = engine.listPlugins()
    assert(plugins.length === 6, `expected 6 plugins, got ${plugins.length}`)
    assert(plugins.includes('heading'), 'has heading plugin')
    assert(plugins.includes('toc'), 'has toc plugin')
  })

  await test('render to HTML produces non-empty string', async () => {
    const md = readFixture('basic.md')
    const html = await engine.render(md, { target: 'html' })
    assert(typeof html === 'string', 'html is string')
    assert(html.length > 0, 'html non-empty')
    assert(html.includes('<h1'), 'html has h1 tag')
  })

  await test('render to VNode produces tree', async () => {
    const md = readFixture('basic.md')
    const vnode = await engine.render(md, { target: 'vnode' })
    assert(vnode !== null, 'vnode not null')
    assert(typeof vnode === 'object', 'vnode is object')
    assert((vnode as Record<string, unknown>).type === 'root', 'vnode root type')
  })

  await test('compile returns both html and vnode', async () => {
    const md = readFixture('basic.md')
    const result = await engine.compile(md)
    assert(result.html.length > 0, 'has html')
    assert(result.vnode !== null, 'has vnode')
    assert(result.ast !== null, 'has ast')
    assert(result.enhancedAST !== null, 'has enhancedAST')
  })

  await test('heading plugin injects IDs', async () => {
    const md = '# Test Heading\n\nContent'
    const result = await engine.compile(md)
    assert(result.enhancedAST !== null, 'has enhanced AST')
    const headings = (result.enhancedAST as Record<string, unknown>)?.headings
    assert(Array.isArray(headings), 'has headings array')
  })

  await test('toc plugin builds table of contents', async () => {
    const md = '# H1\n\n## H2\n\n### H3\n\nContent'
    const result = await engine.compile(md)
    const toc = (result.enhancedAST as Record<string, unknown>)?.toc
    assert(Array.isArray(toc), 'has toc array')
    assert((toc as unknown[]).length >= 3, `toc has >=3 entries, got ${(toc as unknown[]).length}`)
  })

  await test('readingTime plugin computes time', async () => {
    const md = '# Test\n\nThis is some content for reading time estimation.'
    const result = await engine.compile(md)
    const rt = (result.enhancedAST as Record<string, unknown>)?.readingTime
    assert(rt != null, 'has readingTime')
    assert(typeof (rt as Record<string, unknown>)?.minutes === 'number', 'minutes is number')
  })

  await test('errors array is empty on valid input', async () => {
    const md = '# Valid Markdown'
    const result = await engine.compile(md)
    assert(result.errors.length === 0, `expected 0 errors, got ${result.errors.length}`)
  })

  console.log('')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
