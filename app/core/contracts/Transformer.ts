export type {
  TransformerContext,
  TocEntry,
  HeadingInfo,
  LinkInfo,
  ReferenceInfo,
  ReadingTimeInfo,
  TransformerExtraData,
  TransformedAstNode,
  TransformedRootAstNode
} from '@me/ast/types'

import type {
  AstNode,
  TransformerContext,
  TransformedRootAstNode
} from '@me/ast/types'

export interface TransformerContractMethods {
  transform<
    TAst extends AstNode = AstNode,
    TContext extends TransformerContext = TransformerContext
  >(
    ast: TAst,
    context?: TContext
  ): Promise<TransformedRootAstNode>
}

export interface TransformerContractDefinition {
  name: string
  description: string
  methods: TransformerContractMethods
}

export const TransformerContract: TransformerContractDefinition = {
  name: 'Transformer',

  description: 'AST 变换层。所有增强（TOC、Heading ID、Link 改写、Excerpt、Reading Time、Reference、Math 后处理）都在这里。Parser 输出纯净 AST，Transformer 负责增值。',

  methods: {
    async transform<
      TAst extends AstNode = AstNode,
      TContext extends TransformerContext = TransformerContext
    >(
      ast: TAst,
      context: TContext = {} as TContext
    ): Promise<TransformedRootAstNode> {
      throw new Error('[TransformerContract.transform] Not implemented. Expected: AST -> enhanced AST.')
    }
  }
}

export type TransformerContract = TransformerContractMethods

export function assertContract<T>(obj: unknown): asserts obj is T {
  if (obj === null || obj === undefined) {
    throw new Error('[assertContract] Object is null or undefined')
  }
}

export function assertTransformerContract(transformer: unknown): asserts transformer is TransformerContractMethods {
  assertContract<TransformerContractMethods>(transformer)
  if (typeof (transformer as unknown as Record<string, unknown>).transform !== 'function') {
    throw new Error('[TransformerContract] Missing required method: transform(ast, context)')
  }
}
