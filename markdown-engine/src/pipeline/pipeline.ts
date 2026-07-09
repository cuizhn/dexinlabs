/**
 * Render Pipeline — the core flow: Parser → Plugins(Transformers) → Renderer.
 *
 * Framework-agnostic. Uses the engine's internal plugin registry, NOT @core/registry.
 * Migrated from app/render/pipeline.ts with the registry dependency removed.
 */
import { parseMarkdown } from '../parser/markdown'
import { runPlugins, getPlugins } from '../plugins/registry'
import { renderToHTML as doRenderHTML } from '../renderer/htmlRenderer'
import { renderToVNode as doRenderVNode } from '../renderer/vnodeRenderer'
import type {
  RootAstNode,
  AstNode,
  TransformedAstNode,
  TransformedRootAstNode,
  VNode,
  ParserOptions,
  TransformerContext,
  RendererContext
} from '../ast/types'

export type RenderTarget = 'html' | 'vnode'

export type RenderPipelineInput =
  | string
  | RootAstNode
  | { body: string; [key: string]: unknown }
  | { ast: RootAstNode; [key: string]: unknown }
  | null
  | undefined

export interface RenderPipelineResult<TRendered = VNode | string | null> {
  raw: RenderPipelineInput
  ast: RootAstNode | null
  enhancedAST: TransformedRootAstNode | null
  rendered: TRendered | null
  errors: Error[]
}

export interface RenderPipelineOptions {
  parserOptions?: ParserOptions
  transformerContext?: TransformerContext
  rendererContext?: RendererContext
  renderTarget?: RenderTarget
  plugins?: string[]
  [key: string]: unknown
}

export async function runRenderPipeline<TRendered = VNode | string | null>(
  rawContent: RenderPipelineInput,
  opts: RenderPipelineOptions = {}
): Promise<RenderPipelineResult<TRendered>> {
  const result: RenderPipelineResult<TRendered> = {
    raw: rawContent,
    ast: null,
    enhancedAST: null,
    rendered: null,
    errors: []
  }

  try {
    let ast: RootAstNode | null = null

    if (typeof rawContent === 'string') {
      ast = await parseMarkdown(rawContent, opts.parserOptions || {})
    } else if (rawContent && typeof rawContent === 'object') {
      const obj = rawContent as Record<string, unknown>
      if (obj.type === 'root' || obj.ast) {
        ast = (obj.ast || obj) as RootAstNode
      } else if (typeof obj.body === 'string') {
        ast = await parseMarkdown(obj.body as string, opts.parserOptions || {})
      } else {
        ast = rawContent as RootAstNode
      }
    } else {
      ast = rawContent as RootAstNode | null
    }

    result.ast = ast
    let enhanced: TransformedRootAstNode | null = ast as TransformedRootAstNode | null
    result.enhancedAST = enhanced

    if (enhanced) {
      enhanced = await runPlugins(enhanced, opts.transformerContext || {})
      result.enhancedAST = enhanced
    }

    if (enhanced) {
      if (opts.renderTarget === 'html') {
        result.rendered = (await doRenderHTML(enhanced, opts.rendererContext || {})) as unknown as TRendered
      } else {
        result.rendered = (await doRenderVNode(enhanced, opts.rendererContext || {})) as unknown as TRendered
      }
    }
  } catch (e) {
    result.errors.push(e instanceof Error ? e : new Error(String(e)))
  }

  return result
}

export async function renderToHTML(
  rawContent: RenderPipelineInput,
  opts: RenderPipelineOptions = {}
): Promise<string> {
  const r = await runRenderPipeline(rawContent, { ...opts, renderTarget: 'html' })
  return (r.rendered as string | null) || ''
}

export async function renderToVNode(
  rawContent: RenderPipelineInput,
  opts: RenderPipelineOptions = {}
): Promise<VNode | null> {
  const r = await runRenderPipeline(rawContent, { ...opts, renderTarget: 'vnode' })
  return (r.rendered as VNode | null) || null
}

export function listPlugins(): string[] {
  return getPlugins().map(p => p.name)
}

export default { runRenderPipeline, renderToHTML, renderToVNode, listPlugins }
