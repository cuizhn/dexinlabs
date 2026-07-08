import type { AstNode, RootAstNode } from '@core/contracts/Parser.js'

export interface TransformerContext {
  slug?: string
  type?: string
  basePath?: string
  [key: string]: unknown
}

export interface TocEntry {
  id: string
  text: string
  level: number
  children?: TocEntry[]
}

export interface HeadingInfo {
  id: string
  text: string
  level: number
}

export interface LinkInfo {
  original: string
  resolved: string
  type: 'internal' | 'external' | 'asset'
}

export interface ReferenceInfo {
  id: string
  type: string
  label?: string
}

export interface TransformerExtraData {
  toc?: TocEntry[]
  headings?: HeadingInfo[]
  links?: LinkInfo[]
  excerpt?: string
  readingTimeMinutes?: number
  references?: ReferenceInfo[]
  [key: string]: unknown
}

export interface TransformedAstNode extends AstNode {
  id?: string
  [key: string]: unknown
}

export interface TransformedRootAstNode extends RootAstNode {
  toc?: TocEntry[]
  excerpt?: string
  readingTimeMinutes?: number
  headings?: HeadingInfo[]
  links?: LinkInfo[]
  references?: ReferenceInfo[]
  children: TransformedAstNode[]
}

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
