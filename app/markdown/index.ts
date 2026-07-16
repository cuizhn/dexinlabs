import {
  parseMarkdown as doParseMarkdown,
  renderToHTML as doRenderToHTML,
  renderToHast
} from './processor'
import {
  registerPlugin,
  unregisterPlugin,
  getPlugins,
  clearPlugins
} from './plugins/registry'
import { registerBuiltinPlugins } from './plugins/builtin'
import { renderToVNode as hastToVNode } from './renderer/vnode'
import type {
  MarkdownEngine,
  EngineConfig,
  CompileResult,
  RenderOptions,
  RenderResult,
  RenderTarget,
  ParseResult,
  VNode,
  ParserOptions,
  RenderPipelineInput,
  MarkdownMetadata
} from './types'
import type { Root as MdastRoot } from 'mdast'

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

    async render(
      content: RenderPipelineInput,
      opts: Partial<RenderOptions> & { target?: RenderTarget } = {}
    ): Promise<string | VNode | null> {
      const target = opts.target || 'html'
      if (target === 'html') {
        const result = await doRenderToHTML(content, { ...parserOptions, ...opts })
        return result.html
      }
      const result = await runRenderPipeline(content, {
        ...opts,
        renderTarget: 'vnode'
      } as RenderOptions)
      return result.rendered as VNode | null
    },

    async compile(md: string, opts: Partial<RenderOptions> = {}): Promise<CompileResult> {
      const htmlResult = await runRenderPipeline(md, {
        ...opts,
        renderTarget: 'html'
      } as RenderOptions)

      const vnodeResult = await runRenderPipeline(md, {
        ...opts,
        renderTarget: 'vnode'
      } as RenderOptions)

      return {
        html: (htmlResult.rendered as string) || '',
        vnode: (vnodeResult.rendered as VNode) || null,
        metadata: htmlResult.metadata,
        errors: [...htmlResult.errors, ...vnodeResult.errors]
      }
    },

    registerPlugin(plugin: any, order: number = 100): void {
      registerPlugin(plugin, order)
    },

    unregisterPlugin(name: string): void {
      unregisterPlugin(name)
    },

    listPlugins(): string[] {
      return getPlugins().map(p => p.name)
    },

    run(
      content: RenderPipelineInput,
      opts: RenderOptions
    ): Promise<RenderResult> {
      return runRenderPipeline(content, opts)
    }
  }
}

async function runRenderPipeline(
  content: RenderPipelineInput,
  opts: RenderOptions
): Promise<RenderResult> {
  const errors: Error[] = []
  const md = typeof content === 'string' ? content : (content.body || content.content || '') as string

  try {
    const ast = await doParseMarkdown(md, opts.parserOptions || {})
    const metadata: MarkdownMetadata = {
      frontmatter: ast.frontmatter || {},
      toc: ast.toc || [],
      readingTime: ast.readingTime || null
    }

    if (opts.renderTarget === 'html') {
      const { html } = await doRenderToHTML(md, opts.parserOptions || {})
      return {
        rendered: html,
        metadata,
        errors
      }
    }

    if (opts.renderTarget === 'vnode') {
      const { hast } = await renderToHast(md, opts.parserOptions || {})
      const vnode = hastToVNode(hast)

      return {
        rendered: vnode,
        metadata,
        errors
      }
    }

    return {
      rendered: null,
      metadata,
      errors
    }
  } catch (e) {
    errors.push(e instanceof Error ? e : new Error(String(e)))
    return {
      rendered: null,
      metadata: {
        frontmatter: {},
        toc: [],
        readingTime: null
      },
      errors
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

export function setEngine(engine: MarkdownEngine): void {
  defaultEngine = engine
}

export async function renderToHTML(
  content: RenderPipelineInput,
  opts: RenderOptions = { renderTarget: 'html' }
): Promise<string> {
  const result = await runRenderPipeline(content, { ...opts, renderTarget: 'html' })
  return (result.rendered as string) || ''
}

export async function renderToVNode(
  content: RenderPipelineInput,
  opts: RenderOptions = { renderTarget: 'vnode' }
): Promise<VNode | null> {
  const result = await runRenderPipeline(content, { ...opts, renderTarget: 'vnode' })
  return (result.rendered as VNode) || null
}

export { parseMarkdown } from './processor'
export { registerPlugin, unregisterPlugin, getPlugins, clearPlugins } from './plugins/registry'
export { registerBuiltinPlugins } from './plugins/builtin'

export type {
  MarkdownEngine,
  EngineConfig,
  CompileResult,
  RenderOptions,
  RenderResult,
  RenderTarget,
  ParseResult,
  VNode,
  TocEntry,
  ReadingTimeInfo,
  MarkdownMetadata,
  ParserOptions,
  MarkdownPlugin,
  RenderPipelineInput,
  RenderPipelineOptions,
  RenderPipelineResult
} from './types'

export default { createEngine, getEngine, renderToHTML, renderToVNode }
