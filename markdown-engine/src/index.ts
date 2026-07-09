/**
 * Markdown Engine — Public API
 *
 * Per SPEC.md §4, the public API is:
 *   createEngine(), render(), parse(), compile(), registerPlugin()
 *
 * The engine is framework-agnostic (zero Vue/Nuxt/database deps).
 * The app layer (app/render/) creates an engine instance and adapts
 * the output to Vue components.
 */
import { parseMarkdown } from './parser/markdown'
import {
  runRenderPipeline,
  renderToHTML,
  renderToVNode,
  type RenderPipelineInput,
  type RenderPipelineOptions,
  type RenderPipelineResult
} from './pipeline/pipeline'
import {
  registerPlugin,
  unregisterPlugin,
  getPlugins,
  clearPlugins
} from './plugins/registry'
import type { Plugin } from './plugins/types'
import { registerBuiltinPlugins } from './plugins/builtin'
import type { RootAstNode, VNode, TransformedRootAstNode } from './ast/types'

export interface EngineConfig {
  plugins?: string[]
  customPlugins?: Plugin[]
  parserOptions?: Record<string, unknown>
}

export interface CompileResult {
  ast: RootAstNode | null
  enhancedAST: TransformedRootAstNode | null
  html: string
  vnode: VNode | null
  errors: Error[]
}

export interface MarkdownEngine {
  parse(md: string, opts?: Record<string, unknown>): Promise<RootAstNode>
  render(
    content: RenderPipelineInput,
    opts?: Partial<RenderPipelineOptions> & { target?: 'html' | 'vnode' }
  ): Promise<string | VNode | null>
  compile(md: string, opts?: Partial<RenderPipelineOptions>): Promise<CompileResult>
  registerPlugin(plugin: Plugin, order?: number): void
  unregisterPlugin(name: string): void
  listPlugins(): string[]
  run(
    content: RenderPipelineInput,
    opts?: RenderPipelineOptions
  ): Promise<RenderPipelineResult>
}

export function createEngine(config: EngineConfig = {}): MarkdownEngine {
  clearPlugins()
  registerBuiltinPlugins(config.plugins)
  if (config.customPlugins) {
    for (const p of config.customPlugins) {
      registerPlugin(p, p.order || 100)
    }
  }

  return {
    async parse(md: string, opts: Record<string, unknown> = {}): Promise<RootAstNode> {
      return parseMarkdown(md, { ...config.parserOptions, ...opts })
    },

    async render(
      content: RenderPipelineInput,
      opts: Partial<RenderPipelineOptions> & { target?: 'html' | 'vnode' } = {}
    ): Promise<string | VNode | null> {
      const target = opts.target || 'html'
      if (target === 'html') {
        return renderToHTML(content, opts as RenderPipelineOptions)
      }
      return renderToVNode(content, opts as RenderPipelineOptions)
    },

    async compile(
      md: string,
      opts: Partial<RenderPipelineOptions> = {}
    ): Promise<CompileResult> {
      const htmlResult = await runRenderPipeline<string>(md, {
        ...opts,
        renderTarget: 'html'
      } as RenderPipelineOptions)
      const vnodeResult = await runRenderPipeline<VNode>(md, {
        ...opts,
        renderTarget: 'vnode'
      } as RenderPipelineOptions)
      return {
        ast: htmlResult.ast,
        enhancedAST: htmlResult.enhancedAST,
        html: htmlResult.rendered || '',
        vnode: vnodeResult.rendered || null,
        errors: [...htmlResult.errors, ...vnodeResult.errors]
      }
    },

    registerPlugin(plugin: Plugin, order: number = 100): void {
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
      opts: RenderPipelineOptions
    ): Promise<RenderPipelineResult> {
      return runRenderPipeline(content, opts)
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

export { parseMarkdown, runRenderPipeline, renderToHTML, renderToVNode }
export { registerPlugin, unregisterPlugin, getPlugins, clearPlugins }
export { registerBuiltinPlugins }
export type { Plugin } from './plugins/types'
export type {
  AstNode,
  RootAstNode,
  TransformedAstNode,
  TransformedRootAstNode,
  VNode,
  ParserOptions,
  TransformerContext,
  RendererContext,
  TocEntry,
  HeadingInfo,
  ReadingTimeInfo
} from './ast/types'
export type {
  RenderPipelineInput,
  RenderPipelineOptions,
  RenderPipelineResult,
  RenderTarget
} from './pipeline/pipeline'

export default { createEngine, getEngine, parseMarkdown, renderToHTML, renderToVNode }
