/**
 * Built-in plugins — registers the 6 transformers as engine plugins.
 */
import type { Plugin } from './types'
import { registerPlugin } from './registry'
import HeadingTransformer from '../transformer/heading'
import TocTransformer from '../transformer/toc'
import LinksTransformer from '../transformer/links'
import ExcerptTransformer from '../transformer/excerpt'
import ReadingTimeTransformer from '../transformer/readingTime'
import ReferenceTransformer from '../transformer/reference'

const headingPlugin: Plugin = {
  name: 'heading',
  version: '1.0.0',
  transform: (ast, ctx) => HeadingTransformer.transform(ast, ctx) as any
}

const tocPlugin: Plugin = {
  name: 'toc',
  version: '1.0.0',
  transform: (ast, ctx) => TocTransformer.transform(ast, ctx) as any
}

const linksPlugin: Plugin = {
  name: 'links',
  version: '1.0.0',
  transform: (ast, ctx) => LinksTransformer.transform(ast, ctx) as any
}

const excerptPlugin: Plugin = {
  name: 'excerpt',
  version: '1.0.0',
  transform: (ast, ctx) => ExcerptTransformer.transform(ast, ctx) as any
}

const readingTimePlugin: Plugin = {
  name: 'readingTime',
  version: '1.0.0',
  transform: (ast, ctx) => ReadingTimeTransformer.transform(ast, ctx) as any
}

const referencePlugin: Plugin = {
  name: 'reference',
  version: '1.0.0',
  transform: (ast, ctx) => ReferenceTransformer.transform(ast, ctx) as any
}

export const BUILTIN_PLUGINS: Array<{ name: string; order: number; plugin: Plugin }> = [
  { name: 'heading', order: 10, plugin: headingPlugin },
  { name: 'toc', order: 20, plugin: tocPlugin },
  { name: 'links', order: 30, plugin: linksPlugin },
  { name: 'excerpt', order: 40, plugin: excerptPlugin },
  { name: 'readingTime', order: 50, plugin: readingTimePlugin },
  { name: 'reference', order: 100, plugin: referencePlugin }
]

export function registerBuiltinPlugins(enabled?: string[]): string[] {
  const enabledSet = enabled ? new Set(enabled) : null
  const registered: string[] = []
  for (const def of BUILTIN_PLUGINS) {
    if (enabledSet && !enabledSet.has(def.name)) continue
    registerPlugin(def.plugin, def.order)
    registered.push(def.name)
  }
  return registered
}

export default registerBuiltinPlugins
