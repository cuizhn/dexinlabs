import { registerParser } from '@core/registry'
import { createEngine, getEngine } from '@me'
import type { ParserContract } from '@core/contracts/render.js'

interface RegisterRenderOptions {
  parser?: { name?: string }
  transformers?: { enabled?: string[] }
  [key: string]: unknown
}

interface RegisterRenderResult {
  parser: string
  transformers: string[]
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

  return { parser: parserName, transformers: pluginNames }
}

export default registerRender
