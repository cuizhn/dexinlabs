/**
 * Markdown 处理器核心
 *
 * 基于 unified 构建 remark → rehype 处理管线，
 * 按注册顺序应用所有 remark 和 rehype 插件。
 *
 * 提供两个渲染函数：
 * - renderToHTML: 完整渲染（块级 + 行内），返回含 <p> 等块级标签的 HTML
 * - renderInline: 仅行内渲染（bold/italic/code/link/math），去除 <p> 包裹
 */
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'
import { getPlugins } from './plugins/registry'

/**
 * 行内渲染处理器（模块级缓存，避免重复构建）
 *
 * 仅包含行内语法所需的插件：GFM（删除线/表格行内）、Math（行内公式）。
 * 不包含 frontmatter、headingSlug 等块级插件。
 * 使用 processSync 实现同步调用，便于在 Vue 模板中使用。
 */
const inlineProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeKatex, { strict: false })
  .use(rehypeStringify, { allowDangerousHtml: true })

export async function renderToHTML(content: string): Promise<string> {
  const processor = unified().use(remarkParse)

  const plugins = getPlugins()
  for (const plugin of plugins) {
    if (plugin.remark) {
      processor.use(plugin.remark, plugin.options || {})
    }
  }

  // 允许原始 HTML 透传到 rehype 阶段，以支持 Markdown 中内联的 HTML 标签
  // 当前内容来源为数据库中的课程数据（可信来源），如需处理不可信内容，应在渲染后增加 sanitize
  processor.use(remarkRehype, { allowDangerousHtml: true })

  for (const plugin of plugins) {
    if (plugin.rehype) {
      processor.use(plugin.rehype, plugin.options || {})
    }
  }

  // 序列化时保留原始 HTML 标签，与上方 remarkRehype 配置对应
  processor.use(rehypeStringify, { allowDangerousHtml: true })

  try {
    const file = await processor.process(content)
    return String(file)
  } catch (error) {
    throw new Error(
      `[markdown/processor] Markdown 渲染失败: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    )
  }
}

/**
 * renderInline - 行内 Markdown 渲染为 HTML
 *
 * 用于 Block 组件渲染行内内容字段（content/prompt/term 等）。
 * 支持 bold/italic/code/link/math 等行内语法，
 * 输出不含 <p> 包裹，可直接嵌入任意 HTML 容器。
 *
 * 同步函数（基于 processSync），便于在 Vue 模板/computed 中使用。
 *
 * @param content Markdown 行内内容
 * @returns 渲染后的 HTML 字符串（无 <p> 包裹）
 */
export function renderInline(content: string): string {
  if (!content) return ''
  try {
    const html = inlineProcessor.processSync(content).toString()
    // 去除 remark-parse 自动添加的 <p> 包裹
    return html.replace(/^<p>/, '').replace(/<\/p>\n?$/, '')
  } catch {
    // 渲染失败时返回原始文本，避免页面崩溃
    return content
  }
}
