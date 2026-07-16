import type { Root as MdastRoot } from 'mdast'
import type { Root as HastRoot } from 'hast'
import type { VFile } from 'vfile'

export interface VNode {
  type: string
  tag?: string
  props?: Record<string, unknown>
  children?: VNode[]
  text?: string
}

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
  rendered: string | VNode | null
  metadata: MarkdownMetadata
  errors: Error[]
}

export interface CompileResult {
  html: string
  vnode: VNode | null
  metadata: MarkdownMetadata
  errors: Error[]
}

export interface ParseResult {
  metadata: MarkdownMetadata
  errors: Error[]
}

export type RenderTarget = 'html' | 'vnode'

export interface RenderOptions {
  renderTarget: RenderTarget
  parserOptions?: ParserOptions
  [key: string]: unknown
}

export interface MarkdownEngine {
  parse(md: string, opts?: Record<string, unknown>): Promise<ParseResult>
  render(
    content: string | Record<string, unknown>,
    opts?: Partial<RenderOptions> & { target?: RenderTarget }
  ): Promise<string | VNode | null>
  compile(md: string, opts?: Partial<RenderOptions>): Promise<CompileResult>
  registerPlugin(plugin: MarkdownPlugin, order?: number): void
  unregisterPlugin(name: string): void
  listPlugins(): string[]
  run(
    content: string | Record<string, unknown>,
    opts?: RenderOptions
  ): Promise<RenderResult>
}

export type RenderPipelineInput = string | Record<string, unknown>
export type RenderPipelineOptions = RenderOptions
export type RenderPipelineResult = RenderResult

interface EnhancedMdastRoot extends MdastRoot {
  frontmatter?: Record<string, unknown>
  toc?: TocEntry[]
  readingTime?: ReadingTimeInfo
}

interface InternalRenderResult {
  ast: MdastRoot | null
  enhancedAST: EnhancedMdastRoot | null
  hast: HastRoot | null
  rendered: string | VNode | null
  vfile: VFile | null
  errors: Error[]
}
