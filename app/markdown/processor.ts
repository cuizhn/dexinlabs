import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import type { Root as MdastRoot } from 'mdast'
import type { VFile } from 'vfile'
import { getPlugins } from './plugins/registry'
import type { ParserOptions, TocEntry, ReadingTimeInfo, EnhancedMdastRoot } from './types'

function extractFrontmatter(ast: MdastRoot): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  if (!ast.children || ast.children.length === 0) return result

  const firstChild = ast.children[0]
  if (firstChild && firstChild.type === 'yaml') {
    const yamlNode = firstChild as any
    const value = yamlNode.value || ''
    const lines = value.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const colonIndex = trimmed.indexOf(':')
      if (colonIndex > 0) {
        const key = trimmed.slice(0, colonIndex).trim()
        const val = trimmed.slice(colonIndex + 1).trim()
        if (val.startsWith('"') && val.endsWith('"')) {
          result[key] = val.slice(1, -1)
        } else if (val === 'true') {
          result[key] = true
        } else if (val === 'false') {
          result[key] = false
        } else if (!isNaN(Number(val)) && val !== '') {
          result[key] = Number(val)
        } else {
          result[key] = val
        }
      }
    }
  }
  return result
}

function extractToc(ast: MdastRoot): TocEntry[] {
  const entries: TocEntry[] = []
  if (!ast.children) return entries

  for (const node of ast.children) {
    if (node.type === 'heading') {
      const heading = node as any
      const depth = heading.depth || 1
      let text = ''
      let slug = ''

      if (heading.data?.hProperties?.id) {
        slug = heading.data.hProperties.id
      }

      if (heading.children) {
        for (const child of heading.children) {
          if (child.type === 'text') {
            text += (child as any).value || ''
          }
        }
      }

      if (!slug && text) {
        slug = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '')
      }

      entries.push({ depth, text, slug })
    }
  }
  return entries
}

function calculateReadingTime(ast: MdastRoot): ReadingTimeInfo | null {
  let wordCount = 0
  if (!ast.children) return null

  function countWords(node: any): void {
    if (node.type === 'text' && node.value) {
      const words = node.value.trim().split(/\s+/).filter(Boolean)
      wordCount += words.length
    }
    if (node.children) {
      for (const child of node.children) {
        countWords(child)
      }
    }
  }

  for (const child of ast.children) {
    countWords(child)
  }

  const minutes = Math.ceil(wordCount / 200)
  return { minutes, words: wordCount }
}

export async function parseMarkdown(md: string, options: ParserOptions = {}): Promise<EnhancedMdastRoot> {
  const processor = unified().use(remarkParse)
  const plugins = getPlugins()
  const remarkPlugins = plugins.filter(p => p.remark)
  for (const plugin of remarkPlugins) {
    processor.use(plugin.remark, plugin.options || {})
  }

  const ast = processor.parse(md) as unknown as MdastRoot
  const enhancedAst = ast as EnhancedMdastRoot
  enhancedAst.frontmatter = extractFrontmatter(ast)
  enhancedAst.toc = extractToc(ast)
  const rt = calculateReadingTime(ast)
  if (rt) {
    enhancedAst.readingTime = rt
  }

  return enhancedAst
}

export async function renderToHTML(
  content: string,
  options: ParserOptions = {}
): Promise<{ html: string; ast: EnhancedMdastRoot; vfile: VFile }> {
  const processor = unified().use(remarkParse)

  const plugins = getPlugins()
  const remarkPlugins = plugins.filter(p => p.remark)
  for (const plugin of remarkPlugins) {
    processor.use(plugin.remark, plugin.options || {})
  }

  processor.use(remarkRehype, { allowDangerousHtml: true })

  const rehypePlugins = plugins.filter(p => p.rehype)
  for (const plugin of rehypePlugins) {
    processor.use(plugin.rehype, plugin.options || {})
  }

  processor.use(rehypeStringify, { allowDangerousHtml: true })

  const file = await processor.process(content)
  const html = String(file)

  const ast = await parseMarkdown(content, options)

  return { html, ast, vfile: file }
}
