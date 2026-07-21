/**
 * Markdown 处理器核心
 *
 * 基于 unified 构建 remark → rehype 处理管线，
 * 按注册顺序应用所有 remark 和 rehype 插件。
 */
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { getPlugins } from './plugins/registry'

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
