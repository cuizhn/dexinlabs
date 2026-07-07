import { assertSourceContract } from '@modules/content/contracts/Source'
import { assertParserContract } from '@modules/content/contracts/Parser'
import { assertTransformerContract } from '@modules/content/contracts/Transformer'
import { assertRendererContract } from '@modules/content/contracts/Renderer'
import { assertLoaderContract } from '@modules/content/contracts/Loader'
import { assertQueryContract } from '@modules/content/contracts/Query'

const __registry = {
  sources: new Map(),
  loaders: new Map(),
  parsers: new Map(),
  transformers: [],
  renderers: new Map(),
  queries: new Map(),
  plugins: new Map(),

  defaultSource: null,
  defaultParser: null,
  defaultRenderer: null,
  defaultQuery: null
}

export function registerSource(name, source, setAsDefault = false) {
  assertSourceContract(source)
  __registry.sources.set(name, source)
  if (setAsDefault || !__registry.defaultSource) {
    __registry.defaultSource = source
  }
  return source
}

export function registerLoader(name, loader) {
  assertLoaderContract(loader)
  __registry.loaders.set(name, loader)
  return loader
}

export function registerParser(name, parser, setAsDefault = false) {
  assertParserContract(parser)
  __registry.parsers.set(name, parser)
  if (setAsDefault || !__registry.defaultParser) {
    __registry.defaultParser = parser
  }
  return parser
}

export function registerTransformer(name, transformer, order = 100) {
  assertTransformerContract(transformer)
  __registry.transformers.push({ name, order, transformer })
  __registry.transformers.sort((a, b) => a.order - b.order)
  return transformer
}

export function registerRenderer(name, renderer, setAsDefault = false) {
  assertRendererContract(renderer)
  __registry.renderers.set(name, renderer)
  if (setAsDefault || !__registry.defaultRenderer) {
    __registry.defaultRenderer = renderer
  }
  return renderer
}

export function registerQuery(name, query, setAsDefault = false) {
  assertQueryContract(query)
  __registry.queries.set(name, query)
  if (setAsDefault || !__registry.defaultQuery) {
    __registry.defaultQuery = query
  }
  return query
}

export function registerPlugin(name, plugin) {
  __registry.plugins.set(name, plugin)
  return plugin
}

export function getRegistry() {
  return __registry
}

export function getSource(name) {
  return name ? __registry.sources.get(name) : __registry.defaultSource
}

export function getParser(name) {
  return name ? __registry.parsers.get(name) : __registry.defaultParser
}

export function getRenderer(name) {
  return name ? __registry.renderers.get(name) : __registry.defaultRenderer
}

export function getQuery(name) {
  return name ? __registry.queries.get(name) : __registry.defaultQuery
}

export function getTransformers() {
  return __registry.transformers.map(t => t.transformer)
}
