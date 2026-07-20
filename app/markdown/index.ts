import { renderToHTML as doRenderToHTML } from './processor'
import { registerBuiltinPlugins } from './plugins/builtin'

registerBuiltinPlugins()

export async function renderToHTML(content: string): Promise<string> {
  return doRenderToHTML(content)
}

export { registerPlugin, unregisterPlugin, getPlugins, clearPlugins } from './plugins/registry'
export { registerBuiltinPlugins } from './plugins/builtin'
export type { MarkdownPlugin } from './types'

export default { renderToHTML }
