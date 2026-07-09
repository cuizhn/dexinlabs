/**
 * Render Pipeline — IMPLEMENTATION §3 New 8-Step Pipeline（Architecture Upgrade 2026-07-09）.
 *
 * 依据 IMPLEMENTATION.md Decision 1~4 的强制流程，Pipeline 固定为 8 步：
 *   ① Parser           → markdown.ts 薄壳，marked.lexer 解析 → Parser 专有 Token[]（私有）
 *   ② Parser AST       → 以上 Parser 输出，属于 Parser 内部实现，Engine 其他模块禁止直用（D3）
 *   ③ AST Adapter      → adapter/ast-adapter.ts，ParserAST → InternalAST 唯一桥梁（D3）
 *   ④ Internal AST     → types/internal-ast.ts，Engine 核心协议，Transformer/Plugin 只能操作它（D3）
 *   ⑤ Transformer      → plugins/registry.runPlugins()，6 内置插件+自定义插件，纯 AST Transform（D2）
 *   ⑥ Compiler         → compiler/index.ts，InternalAST → RenderTree，屏蔽业务节点细节（D1）
 *   ⑦ Render Tree      → types/render-tree.ts，跨平台渲染协议，三端共享 100% 同一结构（D4）
 *   ⑧ Renderer Adapter → adapters/htmlAdapter / vnodeAdapter / jsonAdapter → 输出 Vue / HTML / JSON（D4）
 *
 * Framework-agnostic. Uses engine's internal plugin registry, NOT @core/registry.
 *
 * 对外签名兼容保证：
 *   runRenderPipeline() / renderToHTML() / renderToVNode() 的函数签名 + 返回值字段
 *   （{ raw, ast, enhancedAST, rendered, errors }）100% 保持不变，上层 Markdown.vue
 *   与 3 个业务页（study / lesson / exercise）零感知，无回归风险。
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

    // Pipeline ①~④：Parser → ParserAST → AST Adapter → InternalAST
    //   （以上 4 步全部封装在 parseMarkdown() 与 ast-adapter.ts）
    result.ast = ast
    let enhanced: TransformedRootAstNode | null = ast as TransformedRootAstNode | null
    result.enhancedAST = enhanced

    // Pipeline ⑤：Transformer（Plugin，纯 AST Transform，D2 合规）
    if (enhanced) {
      enhanced = await runPlugins(enhanced, opts.transformerContext || {})
      result.enhancedAST = enhanced
    }

    // Pipeline ⑥~⑧：Compiler → RenderTree → Renderer Adapter
    //   （以上 3 步全部封装在 htmlRenderer / vnodeRenderer 薄壳）
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
