/**
 * 内置 Markdown 插件的定义与注册
 *
 * 当前包含：GFM（表格/任务列表等）、数学公式（KaTeX）、
 * YAML frontmatter 解析、标题锚点 slug。
 */
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkFrontmatter from 'remark-frontmatter'
import remarkSlug from 'remark-slug'
import rehypeKatex from 'rehype-katex'
import type { MarkdownPlugin } from '../types'
import { registerPlugin } from './registry'

export const BUILTIN_PLUGINS: Record<string, MarkdownPlugin> = {
  // GitHub Flavored Markdown：支持表格、任务列表、删除线等
  gfm: {
    name: 'gfm',
    remark: remarkGfm,
    order: 10
  },
  // 数学公式：remark 阶段识别 $...$ 语法，rehype 阶段用 KaTeX 渲染
  math: {
    name: 'math',
    remark: remarkMath,
    rehype: rehypeKatex,
    options: { strict: false },
    order: 20
  },
  // YAML frontmatter 解析：提取文档元数据，必须在其他 remark 插件之前执行
  frontmatter: {
    name: 'frontmatter',
    remark: remarkFrontmatter,
    options: ['yaml'],
    order: 5
  },
  // 为标题生成 slug 锚点，便于页面内跳转
  headingSlug: {
    name: 'headingSlug',
    remark: remarkSlug,
    order: 30
  }
}

/** 默认启用的内置插件名称列表 */
const DEFAULT_ENABLED_PLUGINS = ['gfm', 'math', 'frontmatter', 'headingSlug'] as const

export function registerBuiltinPlugins(enabledPlugins?: string[]): void {
  const toEnable = enabledPlugins && enabledPlugins.length > 0
    ? enabledPlugins
    : DEFAULT_ENABLED_PLUGINS

  for (const name of toEnable) {
    const plugin = BUILTIN_PLUGINS[name]
    if (plugin) {
      registerPlugin(plugin, plugin.order)
    }
  }
}
