import type { Root as MdastRoot } from 'mdast'

export interface EngineConfig {
  plugins?: string[]
  customPlugins?: MarkdownPlugin[]
  parserOptions?: ParserOptions
}

export interface ParserOptions {
  gfm?: boolean
  math?: boolean
  frontmatter?: boolean
  toc?: boolean
  headingSlug?: boolean
  [key: string]: unknown
}

export interface MarkdownPlugin {
  name: string
  remark?: any
  rehype?: any
  order?: number
  options?: any
}

export interface TocEntry {
  depth: number
  text: string
  slug: string
}

export interface ReadingTimeInfo {
  minutes: number
  words: number
}

export interface MarkdownMetadata {
  frontmatter: Record<string, unknown>
  toc: TocEntry[]
  readingTime: ReadingTimeInfo | null
}

export interface RenderResult {
  rendered: string
  metadata: MarkdownMetadata
  errors: Error[]
}

export interface ParseResult {
  metadata: MarkdownMetadata
  errors: Error[]
}

export interface RenderOptions {
  renderTarget: 'html'
  parserOptions?: ParserOptions
  [key: string]: unknown
}

export interface MarkdownEngine {
  parse(md: string, opts?: Record<string, unknown>): Promise<ParseResult>
  run(content: string, opts?: RenderOptions): Promise<RenderResult>
}

export interface EnhancedMdastRoot extends MdastRoot {
  frontmatter?: Record<string, unknown>
  toc?: TocEntry[]
  readingTime?: ReadingTimeInfo
}
