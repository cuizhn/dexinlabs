import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkFrontmatter from 'remark-frontmatter'
import remarkSlug from 'remark-slug'
import rehypeKatex from 'rehype-katex'
import type { MarkdownPlugin } from '../types'
import { registerPlugin } from './registry'

export const BUILTIN_PLUGINS: Record<string, MarkdownPlugin> = {
  gfm: {
    name: 'gfm',
    remark: remarkGfm,
    order: 10
  },
  math: {
    name: 'math',
    remark: remarkMath,
    rehype: rehypeKatex,
    options: { strict: false },
    order: 20
  },
  frontmatter: {
    name: 'frontmatter',
    remark: remarkFrontmatter,
    options: ['yaml'],
    order: 5
  },
  headingSlug: {
    name: 'headingSlug',
    remark: remarkSlug,
    order: 30
  }
}

export function registerBuiltinPlugins(enabledPlugins?: string[]): void {
  const toEnable = enabledPlugins && enabledPlugins.length > 0
    ? enabledPlugins
    : ['gfm', 'math', 'frontmatter', 'headingSlug']

  for (const name of toEnable) {
    const plugin = BUILTIN_PLUGINS[name]
    if (plugin) {
      registerPlugin(plugin, plugin.order)
    }
  }
}
