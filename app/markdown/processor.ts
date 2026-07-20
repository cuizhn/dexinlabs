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

  processor.use(remarkRehype, { allowDangerousHtml: true })

  for (const plugin of plugins) {
    if (plugin.rehype) {
      processor.use(plugin.rehype, plugin.options || {})
    }
  }

  processor.use(rehypeStringify, { allowDangerousHtml: true })

  const file = await processor.process(content)
  return String(file)
}
