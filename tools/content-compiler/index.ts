/**
 * Content Compiler — Markdown → Lesson AST → Database
 *
 * 读取 lessons/ 中的 Markdown 源文件，使用 remark + unified 生态
 * 解析为 MDAST，再转换为语义化 Lesson AST，最后写入数据库。
 *
 * 运行方式：npx tsx --env-file=.env tools/content-compiler/index.ts
 *
 * 架构决策（ADR-0013）：
 * - Compiler 是开发/构建工具，不属于 app/content/ 运行时系统
 * - Lesson AST 定义在 shared/lesson-ast.ts，是全项目共享的稳定契约
 * - Markdown 必须使用 remark + unified 生态，不重新实现 Parser/Lexer
 * - 自定义 directive（::: definition 等）由 remark-directive 解析，Compiler 转换为对应 Block
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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
import type { Block, Inline, LessonContent } from '../../shared/lesson-ast'

const { lessons } = schema

// ────────────────────────────────────────────
// Markdown 预处理
// ────────────────────────────────────────────

/** 去除 YAML frontmatter（--- ... ---） */
function stripFrontmatter(markdown: string): string {
  return markdown.replace(/^---\n[\s\S]*?\n---\n/, '')
}

/**
 * 规范化 directive 语法以兼容 remark-directive：
 * 1. 移除 ::: 和 directive name 之间的空格（::: definition → :::definition）
 *    remark-directive 要求 name 紧跟 :::，不能有空格
 * 2. 将非标准属性语法 {key:value} 转换为标准语法 {key="value"}
 *    remark-directive 要求属性使用 key="value" 或 key=value 格式
 */
function normalizeDirectives(markdown: string): string {
  return markdown
    .replace(/^:::[ \t]+(\w+)/gm, ':::$1')
    .replace(/\{(\w+):([^}]+)\}/g, '{$1="$2"}')
}

// ────────────────────────────────────────────
// MDAST → Lesson AST 转换
// ────────────────────────────────────────────

/** MDAST 节点的通用类型（兼容 remark-math / remark-directive 扩展节点） */
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

/** 将 MDAST 块级节点转换为 Lesson AST Block（可能返回多个 Block） */
function transformBlock(node: MdastNode): Block | Block[] | null {
  switch (node.type) {
    case 'paragraph': {
      return { type: 'paragraph', children: transformInlines(node.children as MdastNode[]) }
    }
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
      // 块级公式 $$...$$ → FormulaBlock (display: true)
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

/** 转换 directive 节点（::: definition / ::: example / ::: hint / ::: question） */
function transformDirective(node: MdastNode): Block | null {
  const name = node.name as string
  const rawAttrs = (node.attributes || {}) as Record<string, string>
  // trim 属性值（remark-directive 可能保留前导空格）
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
      // 未知 directive，将内容作为普通 Block 处理
      return childBlocks.length > 0 ? childBlocks[0]! : null
  }
}

/**
 * 将完整的 MDAST Root 转换为 LessonContent
 *
 * 分节规则：
 * - h1（# 标题）作为课时标题，不包含在 blocks 中
 * - h2（## 标题）开启新的 SectionBlock，后续内容归入该 section
 * - h3+（### 标题等）作为 HeadingBlock 归入当前 section
 * - h2 之前的内容作为顶层 Block
 */
function transformToLessonAst(root: Root): LessonContent {
  const contentNodes = (root.children as unknown as MdastNode[]).filter(node =>
    node.type !== 'yaml' && node.type !== 'toml'
  )

  // 跳过 h1（课时标题）
  let startIndex = 0
  if (contentNodes[0]?.type === 'heading' && contentNodes[0].depth === 1) {
    startIndex = 1
  }

  const nodes = contentNodes.slice(startIndex)
  const blocks: Block[] = []
  let currentSection: { type: 'section'; title: Inline[]; blocks: Block[] } | null = null

  for (const node of nodes) {
    // h2 开启新 section
    if (node.type === 'heading' && node.depth === 2) {
      // 关闭当前 section
      if (currentSection) {
        blocks.push(currentSection)
      }
      // 开启新 section
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

  // 关闭最后一个 section
  if (currentSection) {
    blocks.push(currentSection)
  }

  return { version: 1, blocks }
}

// ────────────────────────────────────────────
// 编译 & 发布
// ────────────────────────────────────────────

/** 编译 Markdown 为 Lesson AST（不写数据库，用于测试） */
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

/** 读取 Markdown 文件并编译 */
function compileFile(filePath: string): LessonContent {
  const rawMarkdown = readFileSync(filePath, 'utf-8')
  return compileMarkdown(rawMarkdown)
}

/** 打印 Block 类型分布统计 */
function printStats(ast: LessonContent): void {
  console.log(`✓ 编译完成：${ast.blocks.length} 个顶层 Block`)
  const typeCounts: Record<string, number> = {}
  for (const block of ast.blocks) {
    typeCounts[block.type] = (typeCounts[block.type] || 0) + 1
  }
  console.log('  顶层 Block 分布：')
  for (const [type, count] of Object.entries(typeCounts)) {
    console.log(`    ${type}: ${count}`)
  }
}

/** 发布 Lesson AST 到数据库 */
async function publishToDatabase(lessonSlug: string, ast: LessonContent): Promise<void> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is required. Use --env-file=.env')
  }

  const pool = new Pool({ connectionString, max: 1 })
  const db = drizzle(pool, { schema })

  console.log(`\n写入数据库 (slug=${lessonSlug})...`)
  const result = await db.update(lessons)
    .set({ content: ast })
    .where(eq(lessons.slug, lessonSlug))
    .returning({ id: lessons.id, slug: lessons.slug, title: lessons.title })

  if (result.length === 0) {
    console.error(`✗ 未找到 slug=${lessonSlug} 的课时记录`)
    await pool.end()
    process.exit(1)
  }

  const row = result[0]
  console.log(`✓ 已更新：${row!.title} (id=${row!.id})`)
  await pool.end()
}

// ────────────────────────────────────────────
// 主入口
// ────────────────────────────────────────────

async function main() {
  const markdownPath = resolve(
    process.cwd(),
    'lessons/linear-equations/01-basics/01-intro/index.md'
  )
  const lessonSlug = 'intro-to-linear-equations'

  console.log('=== 课程发布脚本 ===')
  console.log(`Markdown: ${markdownPath}`)
  console.log(`Lesson:   ${lessonSlug}\n`)

  // 1. 编译
  const ast = compileFile(markdownPath)
  printStats(ast)

  // 2. 发布到数据库
  await publishToDatabase(lessonSlug, ast)

  console.log('\n发布完成。')
}

main().catch(err => {
  console.error('发布失败:', err)
  process.exit(1)
})
