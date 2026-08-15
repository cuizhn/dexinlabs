/**
 * Content Compiler — Pull / Compile / Push 三阶段工具
 *
 * 支持三种操作模式：
 * - pull: 从数据库读取 Lesson 元数据，创建 Markdown skeleton 到 lessons/
 * - compile: 将 lessons/*.md 编译为 Lesson AST JSON，输出到 compile/output/
 * - push: 将 compile/output/*.json 推送到数据库
 *
 * 运行方式：
 * - npm run content:pull
 * - npm run content:compile
 * - npm run content:push
 *
 * 架构决策（ADR-0013, ADR-014）：
 * - Compiler 是开发/构建工具，不属于 app/content/ 运行时系统
 * - Lesson AST 定义在 shared/lessonAST.ts，是全项目共享的稳定契约
 * - Markdown 必须使用 remark + unified 生态，不重新实现 Parser/Lexer
 * - Pull 不做 AST → Markdown 反向转换，只创建骨架
 * - 已存在的 Markdown 文件不得覆盖
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { resolve, join, basename, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkDirective from 'remark-directive'
import type { Root } from 'mdast'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { eq } from 'drizzle-orm'
import * as schema from '../../app/database/schema'
import type { Block, Inline, LessonContent } from '../../shared/lessonAST'

const { lessons, topics, chapters } = schema

// ────────────────────────────────────────────
// 路径常量
// ────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = resolve(__dirname, '../..')
const LESSONS_DIR = resolve(ROOT_DIR, 'lessons')
const OUTPUT_DIR = resolve(ROOT_DIR, 'compile/output')

// ────────────────────────────────────────────
// 数据库连接
// ────────────────────────────────────────────

function createDb() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is required. Use --env-file=.env')
  }
  const pool = new Pool({ connectionString, max: 1 })
  return { pool, db: drizzle(pool, { schema }) }
}

// ────────────────────────────────────────────
// Pull: Database → Markdown skeleton
// ────────────────────────────────────────────

interface LessonMetadata {
  id: number
  slug: string
  title: string
  order: number
  topicSlug: string | null
  topicTitle: string | null
  chapterSlug: string | null
  chapterTitle: string | null
}

/** 从数据库查询所有 Lesson 的元数据 */
async function fetchLessonMetadata(): Promise<LessonMetadata[]> {
  const { pool, db } = createDb()

  try {
    const result = await db
      .select({
        id: lessons.id,
        slug: lessons.slug,
        title: lessons.title,
        order: lessons.order,
        topicId: lessons.topicId,
        chapterId: lessons.chapterId
      })
      .from(lessons)
      .orderBy(lessons.id)

    const metadata: LessonMetadata[] = []

    for (const lesson of result) {
      let topicSlug: string | null = null
      let topicTitle: string | null = null
      let chapterSlug: string | null = null
      let chapterTitle: string | null = null

      if (lesson.topicId) {
        const topic = await db.query.topics.findFirst({
          where: eq(topics.id, lesson.topicId)
        })
        if (topic) {
          topicSlug = topic.slug
          topicTitle = topic.title
        }
      }

      if (lesson.chapterId) {
        const chapter = await db.query.chapters.findFirst({
          where: eq(chapters.id, lesson.chapterId)
        })
        if (chapter) {
          chapterSlug = chapter.slug
          chapterTitle = chapter.title
        }
      }

      metadata.push({
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        order: lesson.order,
        topicSlug,
        topicTitle,
        chapterSlug,
        chapterTitle
      })
    }

    return metadata
  } finally {
    await pool.end()
  }
}

/** 生成 Markdown skeleton 内容（仅元数据骨架，正文留空，由编辑者编写） */
export function generateSkeleton(metadata: LessonMetadata): string {
  const lines = [
    '---',
    `id: ${metadata.id}`,
    `slug: ${metadata.slug}`,
    `title: ${metadata.title}`
  ]

  if (metadata.topicSlug) {
    lines.push(`topic: ${metadata.topicSlug}`)
  }
  if (metadata.chapterSlug) {
    lines.push(`chapter: ${metadata.chapterSlug}`)
  }

  lines.push('---')
  lines.push('')

  return lines.join('\n')
}

/** 确定 Markdown 文件路径 */
function getMarkdownPath(metadata: LessonMetadata): string {
  const parts: string[] = []

  if (metadata.topicSlug) {
    parts.push(metadata.topicSlug)
  } else {
    parts.push('_unassigned')
  }

  if (metadata.chapterSlug) {
    parts.push(metadata.chapterSlug)
  } else {
    parts.push('_unassigned')
  }

  parts.push(`${metadata.slug}.md`)

  return join(LESSONS_DIR, ...parts)
}

/** Pull 命令：从数据库创建 Markdown skeleton */
async function pullCommand(): Promise<void> {
  console.log('=== Pull: Database → Markdown skeleton ===\n')

  const metadata = await fetchLessonMetadata()
  console.log(`找到 ${metadata.length} 个 Lesson\n`)

  let created = 0
  let skipped = 0

  for (const meta of metadata) {
    const filePath = getMarkdownPath(meta)

    if (existsSync(filePath)) {
      console.log(`⊘ 跳过（已存在）: ${filePath}`)
      skipped++
      continue
    }

    const dir = dirname(filePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    const content = generateSkeleton(meta)
    writeFileSync(filePath, content, 'utf-8')
    console.log(`✓ 创建: ${filePath}`)
    created++
  }

  console.log(`\n完成: 创建 ${created} 个, 跳过 ${skipped} 个`)
}

// ────────────────────────────────────────────
// Compile: Markdown → Lesson AST JSON
// ────────────────────────────────────────────

/** 去除 YAML frontmatter（--- ... ---） */
function stripFrontmatter(markdown: string): string {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
}

/**
 * 规范化 directive 语法以兼容 remark-directive：
 * 1. 移除 ::: 和 directive name 之间的空格（::: definition → :::definition）
 * 2. 将非标准属性语法 {key:value} 转换为标准语法 {key="value"}
 */
function normalizeDirectives(markdown: string): string {
  return markdown
    .replace(/^:::[ \t]+(\w+)/gm, ':::$1')
    .replace(/\{(\w+):([^}]+)\}/g, '{$1="$2"}')
}

/** MDAST 节点的通用类型 */
type MdastNode = { type: string; [key: string]: unknown }

/** 将 MDAST 行内节点转换为 Lesson AST Inline */
function transformInline(node: MdastNode): Inline | null {
  switch (node.type) {
    case 'text':
      return { type: 'text', value: node.value as string }
    case 'strong':
      return { type: 'bold', children: transformInlines(node.children as MdastNode[]) }
    case 'emphasis':
      return { type: 'italic', children: transformInlines(node.children as MdastNode[]) }
    case 'inlineCode':
      return { type: 'code', value: node.value as string }
    case 'link':
      return { type: 'link', url: node.url as string, children: transformInlines(node.children as MdastNode[]) }
    case 'inlineMath':
      return { type: 'math', latex: node.value as string }
    default:
      return null
  }
}

/** 批量转换行内节点，过滤 null */
function transformInlines(nodes: MdastNode[]): Inline[] {
  return nodes.map(transformInline).filter((n): n is Inline => n !== null)
}

/** 将 MDAST 块级节点转换为 Lesson AST Block */
function transformBlock(node: MdastNode): Block | Block[] | null {
  switch (node.type) {
    case 'paragraph':
      return { type: 'paragraph', children: transformInlines(node.children as MdastNode[]) }
    case 'heading': {
      const depth = node.depth as number
      const level = Math.max(1, Math.min(4, depth - 1)) as 1 | 2 | 3 | 4
      return { type: 'heading', level, children: transformInlines(node.children as MdastNode[]) }
    }
    case 'list': {
      const items = (node.children as MdastNode[]).map(item => {
        const inlines: Inline[] = []
        for (const child of (item.children as MdastNode[])) {
          if (child.type === 'paragraph') {
            inlines.push(...transformInlines(child.children as MdastNode[]))
          }
        }
        return inlines
      })
      return { type: 'list', ordered: !!node.ordered, items }
    }
    case 'table': {
      const rows = node.children as MdastNode[]
      const headers = (rows[0]?.children as MdastNode[] || []).map(cell =>
        transformInlines(cell.children as MdastNode[])
      )
      const bodyRows = rows.slice(1).map(row =>
        (row.children as MdastNode[]).map(cell =>
          transformInlines(cell.children as MdastNode[])
        )
      )
      return { type: 'table', headers, rows: bodyRows }
    }
    case 'code':
      return { type: 'code', language: (node.lang as string) || 'text', code: node.value as string }
    case 'thematicBreak':
      return { type: 'divider' }
    case 'math':
      return { type: 'formula', latex: node.value as string, display: true }
    case 'blockquote': {
      const children = transformBlocks(node.children as MdastNode[])
      return { type: 'quote', children }
    }
    case 'containerDirective':
      return transformDirective(node)
    default:
      return null
  }
}

/** 批量转换块级节点，展平数组，过滤 null */
function transformBlocks(nodes: MdastNode[]): Block[] {
  const result: Block[] = []
  for (const node of nodes) {
    const transformed = transformBlock(node)
    if (transformed === null) continue
    if (Array.isArray(transformed)) {
      result.push(...transformed)
    } else {
      result.push(transformed)
    }
  }
  return result
}

/** 转换 directive 节点 */
function transformDirective(node: MdastNode): Block | null {
  const name = node.name as string
  const rawAttrs = (node.attributes || {}) as Record<string, string>
  const attrs: Record<string, string> = {}
  for (const [k, v] of Object.entries(rawAttrs)) {
    attrs[k] = typeof v === 'string' ? v.trim() : v
  }
  const childBlocks = transformBlocks(node.children as MdastNode[])

  switch (name) {
    case 'definition':
      return { type: 'definition', term: attrs.term || '', children: childBlocks }
    case 'example':
      return { type: 'example', title: attrs.title || undefined, children: childBlocks }
    case 'hint':
      return {
        type: 'hint',
        level: (attrs.level as 'info' | 'tip' | 'warning' | 'danger') || 'info',
        children: childBlocks
      }
    case 'question':
      return { type: 'question', prompt: childBlocks, hint: attrs.hint || undefined }
    default:
      return childBlocks.length > 0 ? childBlocks[0]! : null
  }
}

/** 将完整的 MDAST Root 转换为 LessonContent */
function transformToLessonAst(root: Root): LessonContent {
  const contentNodes = (root.children as unknown as MdastNode[]).filter(node =>
    node.type !== 'yaml' && node.type !== 'toml'
  )

  let startIndex = 0
  if (contentNodes[0]?.type === 'heading' && contentNodes[0].depth === 1) {
    startIndex = 1
  }

  const nodes = contentNodes.slice(startIndex)
  const blocks: Block[] = []
  let currentSection: { type: 'section'; title: Inline[]; blocks: Block[] } | null = null

  for (const node of nodes) {
    if (node.type === 'heading' && node.depth === 2) {
      if (currentSection) {
        blocks.push(currentSection)
      }
      currentSection = {
        type: 'section',
        title: transformInlines(node.children as MdastNode[]),
        blocks: []
      }
    } else {
      const transformed = transformBlock(node)
      if (transformed === null) continue
      const newBlocks = Array.isArray(transformed) ? transformed : [transformed]

      if (currentSection) {
        currentSection.blocks.push(...newBlocks)
      } else {
        blocks.push(...newBlocks)
      }
    }
  }

  if (currentSection) {
    blocks.push(currentSection)
  }

  return { version: 1, blocks }
}

/** 编译 Markdown 为 Lesson AST */
export function compileMarkdown(markdown: string): LessonContent {
  const cleaned = normalizeDirectives(stripFrontmatter(markdown))

  const mdast = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkDirective)
    .parse(cleaned) as Root

  return transformToLessonAst(mdast)
}

/** 递归查找所有 Markdown 文件（排除根目录的 index.md） */
function findMarkdownFiles(dir: string, isRoot: boolean = true): string[] {
  const files: string[] = []

  if (!existsSync(dir)) {
    return files
  }

  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath, false))
    } else if (entry.name.endsWith('.md')) {
      // 排除根目录的 index.md（VitePress 首页）
      if (isRoot && entry.name === 'index.md') {
        continue
      }
      files.push(fullPath)
    }
  }

  return files
}

/** 从 Markdown frontmatter 提取 id */
function extractIdFromFrontmatter(markdown: string): number | null {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return null

  const frontmatter = match[1]
  if (!frontmatter) return null
  const idMatch = frontmatter.match(/^id:\s*(\d+)/m)
  if (!idMatch) return null

  const idStr = idMatch[1]
  if (!idStr) return null
  return parseInt(idStr, 10)
}

/** Compile 命令：Markdown → compile/output/*.json */
function compileCommand(): void {
  console.log('=== Compile: Markdown → Lesson AST JSON ===\n')

  const markdownFiles = findMarkdownFiles(LESSONS_DIR)
  console.log(`找到 ${markdownFiles.length} 个 Markdown 文件\n`)

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  let compiled = 0
  let errors = 0

  for (const filePath of markdownFiles) {
    const relativePath = filePath.replace(LESSONS_DIR + '/', '')
    console.log(`编译: ${relativePath}`)

    try {
      const markdown = readFileSync(filePath, 'utf-8')
      const id = extractIdFromFrontmatter(markdown)

      if (!id) {
        console.error(`  ✗ 缺少 id 字段`)
        errors++
        continue
      }

      const ast = compileMarkdown(markdown)
      const outputPath = join(OUTPUT_DIR, `${id}.json`)
      writeFileSync(outputPath, JSON.stringify(ast, null, 2), 'utf-8')

      console.log(`  ✓ 输出: ${id}.json (${ast.blocks.length} blocks)`)
      compiled++
    } catch (err) {
      console.error(`  ✗ 编译失败: ${(err as Error).message}`)
      errors++
    }
  }

  console.log(`\n完成: 编译 ${compiled} 个, 错误 ${errors} 个`)
}

// ────────────────────────────────────────────
// Push: compile/output/*.json → Database
// ────────────────────────────────────────────

/** Push 命令：compile/output/*.json → Database */
async function pushCommand(): Promise<void> {
  console.log('=== Push: compile/output/*.json → Database ===\n')

  if (!existsSync(OUTPUT_DIR)) {
    console.error(`✗ 输出目录不存在: ${OUTPUT_DIR}`)
    console.error('请先运行 compile 命令')
    process.exit(1)
  }

  const jsonFiles = readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json'))
  console.log(`找到 ${jsonFiles.length} 个 JSON 文件\n`)

  if (jsonFiles.length === 0) {
    console.log('没有需要推送的文件')
    return
  }

  const { pool, db } = createDb()

  try {
    let pushed = 0
    let errors = 0

    for (const jsonFile of jsonFiles) {
      const filePath = join(OUTPUT_DIR, jsonFile)
      const id = parseInt(basename(jsonFile, '.json'), 10)

      console.log(`推送: ${jsonFile} (id=${id})`)

      try {
        const json = readFileSync(filePath, 'utf-8')
        const ast = JSON.parse(json) as LessonContent

        const result = await db.update(lessons)
          .set({ content: ast })
          .where(eq(lessons.id, id))
          .returning({ id: lessons.id, slug: lessons.slug, title: lessons.title })

        if (result.length === 0) {
          console.error(`  ✗ 未找到 id=${id} 的课时记录`)
          errors++
          continue
        }

        const row = result[0]
        console.log(`  ✓ 已更新: ${row!.title} (slug=${row!.slug})`)
        pushed++
      } catch (err) {
        console.error(`  ✗ 推送失败: ${(err as Error).message}`)
        errors++
      }
    }

    console.log(`\n完成: 推送 ${pushed} 个, 错误 ${errors} 个`)
  } finally {
    await pool.end()
  }
}

// ────────────────────────────────────────────
// 主入口
// ────────────────────────────────────────────

async function main() {
  const command = process.argv[2]

  switch (command) {
    case 'pull':
      await pullCommand()
      break
    case 'compile':
      compileCommand()
      break
    case 'push':
      await pushCommand()
      break
    default:
      console.error('用法: tsx tools/content-compiler/index.ts <pull|compile|push>')
      console.error('')
      console.error('命令:')
      console.error('  pull     从数据库创建 Markdown skeleton 到 lessons/')
      console.error('  compile  将 lessons/*.md 编译为 compile/output/*.json')
      console.error('  push     将 compile/output/*.json 推送到数据库')
      process.exit(1)
  }
}

// 仅当作为 CLI 直接执行时运行 main()，使模块可被测试安全 import
const invokedUrl = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : ''
if (import.meta.url === invokedUrl) {
  main().catch(err => {
    console.error('执行失败:', err)
    process.exit(1)
  })
}
