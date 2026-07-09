import { registerParser, registerRenderer } from '@core/registry'
import { createEngine, getEngine } from '@me'
import VueRenderer from './renderers/vueRenderer.js'
import type { ParserContract, RendererContract } from '@core/contracts/render.js'

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
  createEngine({ plugins: opts.transformers?.enabled })
  const engine = getEngine()
  const pluginNames = engine.listPlugins()

  const parserName = (opts.parser && opts.parser.name) || 'markdown'
  const parserAdapter = {
    async parse(raw: string, parseOpts?: Record<string, unknown>) {
      return engine.parse(raw, parseOpts || {})
    }
  } as unknown as ParserContract
  registerParser(parserName, parserAdapter, true)

  const rendererName = (opts.renderer && opts.renderer.name) || 'vue'
  registerRenderer(rendererName, VueRenderer as unknown as RendererContract, true)

  return { parser: parserName, transformers: pluginNames, renderer: rendererName }
}

export default registerRender
