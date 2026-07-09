import { parseMarkdown } from '../src/parser/markdown'
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
  console.log('=== Parser Tests ===')

  await test('parses basic.md into AST with heading nodes', async () => {
    const md = readFixture('basic.md')
    const ast = await parseMarkdown(md)
    assert(ast.type === 'root', 'root type')
    assert(ast.frontmatter.title === 'Basic Test', 'frontmatter title')
    assert(Array.isArray(ast.children), 'has children')
    assert(ast.children.length > 0, 'non-empty children')

    const headings = ast.children.filter(n => n.type === 'heading')
    assert(headings.length >= 2, `expected >=2 headings, got ${headings.length}`)
    assert((headings[0] as Record<string, unknown>).depth === 1, 'first heading depth=1')
  })

  await test('parses code blocks', async () => {
    const md = readFixture('code.md')
    const ast = await parseMarkdown(md)
    const codeNodes = ast.children.filter(n => n.type === 'code')
    assert(codeNodes.length >= 2, `expected >=2 code nodes, got ${codeNodes.length}`)
  })

  await test('parses table', async () => {
    const md = readFixture('table.md')
    const ast = await parseMarkdown(md)
    const tableNodes = ast.children.filter(n => n.type === 'table')
    assert(tableNodes.length >= 1, `expected >=1 table, got ${tableNodes.length}`)
  })

  await test('parses list items', async () => {
    const md = readFixture('basic.md')
    const ast = await parseMarkdown(md)
    const listNodes = ast.children.filter(n => n.type === 'list')
    assert(listNodes.length >= 1, `expected >=1 list, got ${listNodes.length}`)
  })

  await test('extracts frontmatter', async () => {
    const md = readFixture('basic.md')
    const ast = await parseMarkdown(md)
    assert(ast.frontmatter.title === 'Basic Test', 'frontmatter title extracted')
    assert(typeof ast.content === 'string', 'content is string')
    assert(!ast.content.trimStart().startsWith('---'), 'frontmatter stripped from content')
  })

  await test('handles empty string', async () => {
    const ast = await parseMarkdown('')
    assert(ast.type === 'root', 'root type for empty')
    assert(Array.isArray(ast.children), 'has children array')
  })

  await test('math option injects math nodes', async () => {
    const md = readFixture('math.md')
    const ast = await parseMarkdown(md, { math: true })
    const mathNodes = JSON.stringify(ast.children).includes('"type":"math"') ||
      JSON.stringify(ast.children).includes('"type":"inlineMath"')
    assert(mathNodes, 'math nodes present')
  })

  console.log('')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
