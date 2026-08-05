/**
 * Markdown 渲染模块的公共入口
 *
 * 提供将 Markdown 转换为 HTML 的核心函数。
 * 模块加载时会自动注册内置插件。
 *
 * 职责边界：
 * - 负责：markdown → AST → HTML
 * - 不负责：Lesson/Topic/Domain 等业务概念
 */
import { renderToHTML as doRenderToHTML, renderInline as doRenderInline } from './processor'
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

/**
 * 将行内 Markdown 渲染为 HTML 字符串（无 <p> 包裹）
 *
 * 用于 Block 组件渲染行内内容字段。
 * 同步函数，支持 bold/italic/code/link/math 等行内语法。
 *
 * @param content - Markdown 行内内容
 * @returns 渲染后的 HTML 字符串（不含块级标签）
 */
export function renderInline(content: string): string {
  return doRenderInline(content)
}

// 插件管理 API 仅内部使用，不对外导出
// 如需扩展插件系统，可在此处添加 registerPlugin 等函数
export type { MarkdownPlugin } from './types'

