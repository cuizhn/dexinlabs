import { registerParser, registerTransformer, registerRenderer } from '@core/registry'
import MarkdownParser from './parsers/markdown.js'
import HeadingTransformer from './transformers/heading.js'
import TocTransformer from './transformers/toc.js'
import LinksTransformer from './transformers/links.js'
import ExcerptTransformer from './transformers/excerpt.js'
import ReadingTimeTransformer from './transformers/readingTime.js'
import ReferenceTransformer from './transformers/reference.js'
import VueRenderer from './renderers/vueRenderer.js'
import type { ParserContract, TransformerContract, RendererContract } from '@core/contracts/render.js'

interface TransformerDef {
  name: string
  order: number
  module: TransformerContract
}

const TRANSFORMER_DEFS: TransformerDef[] = [
  { name: 'heading',      order: 10,  module: HeadingTransformer as TransformerContract },
  { name: 'toc',          order: 20,  module: TocTransformer as TransformerContract },
  { name: 'links',        order: 30,  module: LinksTransformer as TransformerContract },
  { name: 'excerpt',      order: 40,  module: ExcerptTransformer as TransformerContract },
  { name: 'readingTime',  order: 50,  module: ReadingTimeTransformer as TransformerContract },
  { name: 'reference',    order: 100, module: ReferenceTransformer as TransformerContract }
]

interface RegisterRenderOptions {
  parser?: { name?: string }
  transformers?: { enabled?: string[] }
  renderer?: { name?: string }
  [key: string]: unknown
}

interface RegisterRenderResult {
  parser: string
  transformers: string[]
  renderer: string
}

export function registerRender(opts: RegisterRenderOptions = {}): RegisterRenderResult {
  const parserName = (opts.parser && opts.parser.name) || 'markdown'
  registerParser(parserName, MarkdownParser as ParserContract, true)

  const enabled: Set<string> | null = (opts.transformers && opts.transformers.enabled) ? new Set(opts.transformers.enabled) : null
  const registered: string[] = []
  for (const def of TRANSFORMER_DEFS) {
    if (enabled && !enabled.has(def.name)) continue
    registerTransformer(def.name, def.module, def.order)
    registered.push(def.name)
  }

  const rendererName = (opts.renderer && opts.renderer.name) || 'vue'
  registerRenderer(rendererName, VueRenderer as RendererContract, true)

  return { parser: parserName, transformers: registered, renderer: rendererName }
}

export default registerRender
