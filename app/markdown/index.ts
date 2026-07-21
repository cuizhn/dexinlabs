/**
 * Markdown 渲染模块的公共入口
 *
 * 提供将 Markdown 转换为 HTML 的核心函数，以及插件的注册/管理能力。
 * 模块加载时会自动注册内置插件。
 */
import { renderToHTML as doRenderToHTML } from './processor'
import { registerBuiltinPlugins } from './plugins/builtin'

// 模块加载时自动注册内置插件，确保首次调用 renderToHTML 前插件已就绪
registerBuiltinPlugins()

/**
 * 将 Markdown 文本渲染为 HTML 字符串
 *
 * 内部使用 unified 处理器链（remark → rehype），
 * 所有已注册的 remark/rehype 插件均会参与处理。
 *
 * @param content - Markdown 源文本
 * @returns 渲染后的 HTML 字符串
 */
export async function renderToHTML(content: string): Promise<string> {
  return doRenderToHTML(content)
}

export { registerPlugin, unregisterPlugin, getPlugins, clearPlugins } from './plugins/registry'
export { registerBuiltinPlugins } from './plugins/builtin'
export type { MarkdownPlugin } from './types'

