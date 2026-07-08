import {
  SourceContract as SourceContractDef,
  assertSourceContract,
  LoaderContract as LoaderContractDef,
  assertLoaderContract,
  QueryContract as QueryContractDef,
  assertQueryContract
} from '@core/contracts/data.js'

import {
  ParserContract as ParserContractDef,
  assertParserContract,
  TransformerContract as TransformerContractDef,
  assertTransformerContract,
  RendererContract as RendererContractDef,
  assertRendererContract
} from '@core/contracts/render.js'

export type SourceContract = typeof SourceContractDef.methods
export type LoaderContract = typeof LoaderContractDef.methods
export type ParserContract = typeof ParserContractDef.methods
export type TransformerContract = typeof TransformerContractDef.methods
export type RendererContract = typeof RendererContractDef.methods
export type QueryContract = typeof QueryContractDef.methods

export function assertSourceContractGeneric<TSource extends SourceContract>(x: unknown): asserts x is TSource {
  assertSourceContract(x)
}

export function assertParserContractGeneric<TParser extends ParserContract>(x: unknown): asserts x is TParser {
  assertParserContract(x)
}

export function assertTransformerContractGeneric<TTransformer extends TransformerContract>(x: unknown): asserts x is TTransformer {
  assertTransformerContract(x)
}

export function assertRendererContractGeneric<TRenderer extends RendererContract>(x: unknown): asserts x is TRenderer {
  assertRendererContract(x)
}

export function assertLoaderContractGeneric<TLoader extends LoaderContract>(x: unknown): asserts x is TLoader {
  assertLoaderContract(x)
}

export function assertQueryContractGeneric<TQuery extends QueryContract>(x: unknown): asserts x is TQuery {
  assertQueryContract(x)
}

type TransformerEntry<TTransformer extends TransformerContract = TransformerContract> = {
  name: string
  order: number
  transformer: TTransformer
}

type RegistryShape<
  TSource extends SourceContract = SourceContract,
  TLoader extends LoaderContract = LoaderContract,
  TParser extends ParserContract = ParserContract,
  TTransformer extends TransformerContract = TransformerContract,
  TRenderer extends RendererContract = RendererContract,
  TQuery extends QueryContract = QueryContract,
  TPlugin = unknown
> = {
  sources: Map<string, TSource>
  loaders: Map<string, TLoader>
  parsers: Map<string, TParser>
  transformers: TransformerEntry<TTransformer>[]
  renderers: Map<string, TRenderer>
  queries: Map<string, TQuery>
  plugins: Map<string, TPlugin>

  defaultSource: TSource | null
  defaultParser: TParser | null
  defaultRenderer: TRenderer | null
  defaultQuery: TQuery | null
}

const __registry: RegistryShape = {
  sources: new Map<string, SourceContract>(),
  loaders: new Map<string, LoaderContract>(),
  parsers: new Map<string, ParserContract>(),
  transformers: [] as TransformerEntry[],
  renderers: new Map<string, RendererContract>(),
  queries: new Map<string, QueryContract>(),
  plugins: new Map<string, unknown>(),

  defaultSource: null,
  defaultParser: null,
  defaultRenderer: null,
  defaultQuery: null
}

export function registerSource<TSource extends SourceContract>(
  name: string,
  source: TSource,
  setAsDefault = false
): TSource {
  assertSourceContractGeneric<TSource>(source)
  __registry.sources.set(name, source)
  if (setAsDefault || !__registry.defaultSource) {
    __registry.defaultSource = source
  }
  return source
}

export function registerLoader<TLoader extends LoaderContract>(
  name: string,
  loader: TLoader
): TLoader {
  assertLoaderContractGeneric<TLoader>(loader)
  __registry.loaders.set(name, loader)
  return loader
}

export function registerParser<TParser extends ParserContract>(
  name: string,
  parser: TParser,
  setAsDefault = false
): TParser {
  assertParserContractGeneric<TParser>(parser)
  __registry.parsers.set(name, parser)
  if (setAsDefault || !__registry.defaultParser) {
    __registry.defaultParser = parser
  }
  return parser
}

export function registerTransformer<TTransformer extends TransformerContract>(
  name: string,
  transformer: TTransformer,
  order = 100
): TTransformer {
  assertTransformerContractGeneric<TTransformer>(transformer)
  __registry.transformers.push({ name, order, transformer })
  __registry.transformers.sort((a, b) => a.order - b.order)
  return transformer
}

export function registerRenderer<TRenderer extends RendererContract>(
  name: string,
  renderer: TRenderer,
  setAsDefault = false
): TRenderer {
  assertRendererContractGeneric<TRenderer>(renderer)
  __registry.renderers.set(name, renderer)
  if (setAsDefault || !__registry.defaultRenderer) {
    __registry.defaultRenderer = renderer
  }
  return renderer
}

export function registerQuery<TQuery extends QueryContract>(
  name: string,
  query: TQuery,
  setAsDefault = false
): TQuery {
  assertQueryContractGeneric<TQuery>(query)
  __registry.queries.set(name, query)
  if (setAsDefault || !__registry.defaultQuery) {
    __registry.defaultQuery = query
  }
  return query
}

export function registerPlugin<TPlugin = unknown>(
  name: string,
  plugin: TPlugin
): TPlugin {
  __registry.plugins.set(name, plugin)
  return plugin
}

export function getRegistry(): RegistryShape {
  return __registry
}

export function getSource<TSource extends SourceContract>(name?: string): TSource | null | undefined {
  return (name ? __registry.sources.get(name) : __registry.defaultSource) as TSource | null | undefined
}

export function getParser<TParser extends ParserContract>(name?: string): TParser | null | undefined {
  return (name ? __registry.parsers.get(name) : __registry.defaultParser) as TParser | null | undefined
}

export function getRenderer<TRenderer extends RendererContract>(name?: string): TRenderer | null | undefined {
  return (name ? __registry.renderers.get(name) : __registry.defaultRenderer) as TRenderer | null | undefined
}

export function getQuery<TQuery extends QueryContract>(name?: string): TQuery | null | undefined {
  return (name ? __registry.queries.get(name) : __registry.defaultQuery) as TQuery | null | undefined
}

export function getLoader<TLoader extends LoaderContract>(name?: string): TLoader | null | undefined {
  return (name ? __registry.loaders.get(name) : undefined) as TLoader | null | undefined
}

export function getTransformers<TTransformer extends TransformerContract>(): TTransformer[] {
  return __registry.transformers.map(t => t.transformer) as TTransformer[]
}
