import {
  parseMarkdown as doParseMarkdown,
  renderToHTML as doRenderToHTML
} from './processor'
import {
  registerPlugin,
  unregisterPlugin,
  getPlugins,
  clearPlugins
} from './plugins/registry'
import { registerBuiltinPlugins } from './plugins/builtin'
import type {
  MarkdownEngine,
  EngineConfig,
  RenderOptions,
  RenderResult,
  ParseResult,
  MarkdownMetadata,
  TocEntry,
  ReadingTimeInfo,
  ParserOptions,
  MarkdownPlugin
} from './types'

export function createEngine(config: EngineConfig = {}): MarkdownEngine {
  clearPlugins()
  registerBuiltinPlugins(config.plugins)
  if (config.customPlugins) {
    for (const p of config.customPlugins) {
      registerPlugin(p, p.order || 100)
    }
  }

  const parserOptions: ParserOptions = config.parserOptions || {}

  return {
    async parse(md: string, opts: Record<string, unknown> = {}): Promise<ParseResult> {
      const ast = await doParseMarkdown(md, { ...parserOptions, ...opts })
      return {
        metadata: {
          frontmatter: ast.frontmatter || {},
          toc: ast.toc || [],
          readingTime: ast.readingTime || null
        },
        errors: []
      }
    },

    async run(
      content: string,
      opts: RenderOptions = { renderTarget: 'html' }
    ): Promise<RenderResult> {
      const errors: Error[] = []
      try {
        const ast = await doParseMarkdown(content, opts.parserOptions || {})
        const metadata: MarkdownMetadata = {
          frontmatter: ast.frontmatter || {},
          toc: ast.toc || [],
          readingTime: ast.readingTime || null
        }

        const { html } = await doRenderToHTML(content, opts.parserOptions || {})
        return {
          rendered: html,
          metadata,
          errors
        }
      } catch (e) {
        errors.push(e instanceof Error ? e : new Error(String(e)))
        return {
          rendered: '',
          metadata: {
            frontmatter: {},
            toc: [],
            readingTime: null
          },
          errors
        }
      }
    }
  }
}

let defaultEngine: MarkdownEngine | null = null

export function getEngine(): MarkdownEngine {
  if (!defaultEngine) {
    defaultEngine = createEngine()
  }
  return defaultEngine
}

export async function renderToHTML(
  content: string,
  opts: RenderOptions = { renderTarget: 'html' }
): Promise<string> {
  const engine = getEngine()
  const result = await engine.run(content, opts)
  return result.rendered
}

export { registerPlugin, unregisterPlugin, getPlugins, clearPlugins } from './plugins/registry'
export { registerBuiltinPlugins } from './plugins/builtin'

export type {
  MarkdownEngine,
  EngineConfig,
  RenderOptions,
  RenderResult,
  ParseResult,
  TocEntry,
  ReadingTimeInfo,
  MarkdownMetadata,
  ParserOptions,
  MarkdownPlugin
} from './types'

export default { getEngine, renderToHTML }
