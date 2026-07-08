import { ParserContract, assertParserContract } from '@core/contracts/Parser.js'
import type {
  AstNodeType,
  AstNode,
  RootAstNode,
  ParserOptions,
  ParserOutputShape,
  ParserContractMethods,
  ParserContractDefinition
} from '@core/contracts/Parser.js'

import { TransformerContract, assertTransformerContract } from '@core/contracts/Transformer.js'
import type {
  TransformerContext,
  TocEntry,
  HeadingInfo,
  LinkInfo,
  ReferenceInfo,
  TransformerExtraData,
  TransformedAstNode,
  TransformedRootAstNode,
  TransformerContractMethods,
  TransformerContractDefinition
} from '@core/contracts/Transformer.js'

import { RendererContract, assertRendererContract } from '@core/contracts/Renderer.js'
import type {
  RendererContext,
  VNode,
  RenderedOutput,
  RendererContractMethods,
  RendererContractDefinition
} from '@core/contracts/Renderer.js'

export {
  ParserContract,
  assertParserContract,
  TransformerContract,
  assertTransformerContract,
  RendererContract,
  assertRendererContract
}

export type {
  AstNodeType,
  AstNode,
  RootAstNode,
  ParserOptions,
  ParserOutputShape,
  ParserContractMethods,
  ParserContractDefinition,
  TransformerContext,
  TocEntry,
  HeadingInfo,
  LinkInfo,
  ReferenceInfo,
  TransformerExtraData,
  TransformedAstNode,
  TransformedRootAstNode,
  TransformerContractMethods,
  TransformerContractDefinition,
  RendererContext,
  VNode,
  RenderedOutput,
  RendererContractMethods,
  RendererContractDefinition
}

export const RENDER_CONTRACTS = {
  Parser: 'Parser' as const,
  Transformer: 'Transformer' as const,
  Renderer: 'Renderer' as const
}

export type RenderContractKey = typeof RENDER_CONTRACTS[keyof typeof RENDER_CONTRACTS]

export default {
  RENDER_CONTRACTS,
  ParserContract,
  assertParserContract,
  TransformerContract,
  assertTransformerContract,
  RendererContract,
  assertRendererContract
}
