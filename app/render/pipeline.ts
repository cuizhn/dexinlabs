/**
 * Render Pipeline — Vue adapter bridge to the standalone markdown-engine.
 *
 * This is a thin wrapper that delegates to the engine's pipeline.
 * The core/engine facade imports from here, so export signatures are preserved.
 * Old registry-based options (parser/transformers/renderer) are accepted but ignored —
 * the engine owns its own internal plugin registry.
 */
import { getEngine } from '@me'
import type {
  RenderPipelineInput as EngineRenderPipelineInput,
  RenderPipelineResult as EngineRenderPipelineResult,
  VNode
} from '@me'

export type RenderTarget = 'html' | 'vnode'

export type RenderPipelineInput = EngineRenderPipelineInput

export interface RenderPipelineResult<TRendered = VNode | string | null>
  extends EngineRenderPipelineResult<TRendered> {}

export interface RenderPipelineOptions {
  parserOptions?: Record<string, unknown>
  transformerContext?: Record<string, unknown>
  rendererContext?: Record<string, unknown>
  renderTarget?: RenderTarget
  plugins?: string[]
  [key: string]: unknown
}

export interface RenderPipelineInstance {
  run<TRendered = VNode | string | null>(
    content: RenderPipelineInput,
    opts?: RenderPipelineOptions
  ): Promise<RenderPipelineResult<TRendered>>
  toHTML(content: RenderPipelineInput, opts?: RenderPipelineOptions): Promise<string>
  toVNode(content: RenderPipelineInput, opts?: RenderPipelineOptions): Promise<VNode | null>
}

const engine = getEngine()

export async function runRenderPipeline<TRendered = VNode | string | null>(
  rawContent: RenderPipelineInput,
  opts: RenderPipelineOptions = {}
): Promise<RenderPipelineResult<TRendered>> {
  const target = (opts.renderTarget as RenderTarget) || 'vnode'
  return engine.run(rawContent, {
    parserOptions: opts.parserOptions,
    transformerContext: opts.transformerContext,
    rendererContext: opts.rendererContext,
    renderTarget: target,
    plugins: opts.plugins
  }) as Promise<RenderPipelineResult<TRendered>>
}

export async function renderToHTML(
  rawContent: RenderPipelineInput,
  opts: RenderPipelineOptions = {}
): Promise<string> {
  const r = await runRenderPipeline<string>(rawContent, { ...opts, renderTarget: 'html' })
  return (r.rendered as string | null) || ''
}

export async function renderToVNode(
  rawContent: RenderPipelineInput,
  opts: RenderPipelineOptions = {}
): Promise<VNode | null> {
  const r = await runRenderPipeline<VNode>(rawContent, { ...opts, renderTarget: 'vnode' })
  return (r.rendered as VNode | null) || null
}

export function createRenderPipeline(overrides: RenderPipelineOptions = {}): RenderPipelineInstance {
  return {
    async run<TRendered = VNode | string | null>(
      content: RenderPipelineInput,
      opts: RenderPipelineOptions = {}
    ): Promise<RenderPipelineResult<TRendered>> {
      return runRenderPipeline<TRendered>(content, { ...overrides, ...opts })
    },
    async toHTML(content: RenderPipelineInput, opts: RenderPipelineOptions = {}): Promise<string> {
      return renderToHTML(content, { ...overrides, ...opts })
    },
    async toVNode(content: RenderPipelineInput, opts: RenderPipelineOptions = {}): Promise<VNode | null> {
      return renderToVNode(content, { ...overrides, ...opts })
    }
  }
}

export default { runRenderPipeline, renderToHTML, renderToVNode, createRenderPipeline }
