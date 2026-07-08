import { getParser, getRenderer, getTransformers } from '@core/registry'
import type {
  ParserContract,
  RendererContract,
  TransformerContract,
  RootAstNode,
  AstNode,
  TransformedAstNode,
  TransformedRootAstNode,
  ParserOptions,
  VNode,
  RenderedOutput
} from '@core/contracts/render.js'

export type RenderTarget = 'html' | 'vnode'

export type RenderPipelineInput =
  | string
  | RootAstNode
  | AstNode
  | { body: string; [key: string]: unknown }
  | { ast: RootAstNode | AstNode; [key: string]: unknown }
  | null
  | undefined

export interface RenderPipelineResult<TRendered = VNode | string | null> {
  raw: RenderPipelineInput
  ast: RootAstNode | AstNode | null
  enhancedAST: TransformedAstNode | TransformedRootAstNode | null
  rendered: TRendered | null
  errors: Error[]
}

export interface RenderPipelineOptions {
  parser?: ParserContract
  transformers?: TransformerContract[]
  renderer?: RendererContract
  parserOptions?: ParserOptions
  renderTarget?: RenderTarget
  pipelineResult?: RenderPipelineResult
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

  const parser: ParserContract | undefined = opts.parser || getParser() || undefined
  const transformers: TransformerContract[] = opts.transformers || getTransformers()
  const renderer: RendererContract | undefined = opts.renderer || getRenderer() || undefined

  try {
    if (parser && typeof rawContent === 'string') {
      result.ast = await parser.parse(rawContent, opts.parserOptions || {})
    } else if (rawContent && typeof rawContent === 'object') {
      const obj = rawContent as Record<string, unknown>
      if (obj.type === 'root' || obj.ast) {
        result.ast = (obj.ast || obj) as RootAstNode | AstNode
      } else if (typeof obj.body === 'string') {
        const body: string = obj.body
        if (parser) {
          result.ast = await parser.parse(body, opts.parserOptions || {})
        } else {
          result.ast = {
            type: 'root',
            children: [],
            frontmatter: {},
            content: body,
            __passthrough: true
          } as unknown as RootAstNode
        }
      } else {
        result.ast = rawContent as RootAstNode | AstNode
      }
    } else {
      result.ast = rawContent as RootAstNode | AstNode | null
    }

    result.enhancedAST = result.ast as unknown as TransformedRootAstNode | TransformedAstNode | null

    for (const t of transformers) {
      try {
        result.enhancedAST = await t.transform(
          (result.enhancedAST as AstNode) || ({} as AstNode),
          {
            ...opts,
            pipelineResult: result
          }
        )
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        result.errors.push(new Error(`[RenderPipeline][Transformer] ${msg}`))
      }
    }

    if (renderer && result.enhancedAST) {
      try {
        if (opts.renderTarget === 'html') {
          result.rendered = (await renderer.renderToHTML(
            result.enhancedAST as TransformedRootAstNode,
            opts
          )) as unknown as TRendered
        } else {
          result.rendered = renderer.renderToVNode
            ? ((await renderer.renderToVNode(
                result.enhancedAST as TransformedRootAstNode,
                opts
              )) as unknown as TRendered)
            : ((await renderer.renderToHTML(
                result.enhancedAST as TransformedRootAstNode,
                opts
              )) as unknown as TRendered)
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        result.errors.push(new Error(`[RenderPipeline][Renderer] ${msg}`))
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

export function createRenderPipeline(overrides: RenderPipelineOptions = {}): RenderPipelineInstance {
  return {
    async run<TRendered = VNode | string | null>(
      content: RenderPipelineInput,
      opts: RenderPipelineOptions = {}
    ): Promise<RenderPipelineResult<TRendered>> {
      return runRenderPipeline<TRendered>(content, { ...overrides, ...opts })
    },
    async toHTML(
      content: RenderPipelineInput,
      opts: RenderPipelineOptions = {}
    ): Promise<string> {
      return renderToHTML(content, { ...overrides, ...opts })
    },
    async toVNode(
      content: RenderPipelineInput,
      opts: RenderPipelineOptions = {}
    ): Promise<VNode | null> {
      return renderToVNode(content, { ...overrides, ...opts })
    }
  }
}

export default { runRenderPipeline, renderToHTML, renderToVNode, createRenderPipeline }
