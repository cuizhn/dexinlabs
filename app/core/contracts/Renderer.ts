
export type {
  RendererContext,
  VNode,
  RenderedOutput
} from '@me/ast/types'

import type {
  TransformedAstNode,
  TransformedRootAstNode,
  RendererContext,
  VNode
} from '@me/ast/types'

export interface RendererContractMethods {
  renderToVNode<
    TAst extends TransformedAstNode | TransformedRootAstNode = TransformedRootAstNode,
    TContext extends RendererContext = RendererContext
  >(
    ast: TAst,
    context?: TContext
  ): Promise<VNode>

  renderToHTML<
    TAst extends TransformedAstNode | TransformedRootAstNode = TransformedRootAstNode,
    TContext extends RendererContext = RendererContext
  >(
    ast: TAst,
    context?: TContext
  ): Promise<string>
}

export interface RendererContractDefinition {
  name: string
  description: string
  methods: RendererContractMethods
}

export const RendererContract: RendererContractDefinition = {
  name: 'Renderer',

  description: '只做渲染：AST → Vue 组件树 / HTML 字符串。不解析 Markdown，不查询数据库。',

  methods: {
    async renderToVNode<
      TAst extends TransformedAstNode | TransformedRootAstNode = TransformedRootAstNode,
      TContext extends RendererContext = RendererContext
    >(
      ast: TAst,
      context: TContext = {} as TContext
    ): Promise<VNode> {
      throw new Error('[RendererContract.renderToVNode] Not implemented.')
    },

    async renderToHTML<
      TAst extends TransformedAstNode | TransformedRootAstNode = TransformedRootAstNode,
      TContext extends RendererContext = RendererContext
    >(
      ast: TAst,
      context: TContext = {} as TContext
    ): Promise<string> {
      throw new Error('[RendererContract.renderToHTML] Not implemented.')
    }
  }
}

export type RendererContract = RendererContractMethods

export function assertContract<T>(obj: unknown): asserts obj is T {
  if (obj === null || obj === undefined) {
    throw new Error('[assertContract] Object is null or undefined')
  }
}

export function assertRendererContract(renderer: unknown): asserts renderer is RendererContractMethods {
  assertContract<RendererContractMethods>(renderer)
  const rendererObj = renderer as unknown as Record<string, unknown>
  if (typeof rendererObj.renderToVNode !== 'function' && typeof rendererObj.renderToHTML !== 'function') {
    throw new Error('[RendererContract] At least one of renderToVNode / renderToHTML must be implemented.')
  }
}
