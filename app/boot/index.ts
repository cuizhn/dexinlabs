import { registerData } from '@data/register'
import { registerRender } from '@render/register'
import { initContentEngine, getEngine, type EngineFacade } from '@core/engine'

export { registerData, registerRender }

export interface BootEngineOptions {
  data?: Parameters<typeof registerData>[0]
  render?: Parameters<typeof registerRender>[0]
}

export interface BootEngineResult {
  ok: boolean
  engine: EngineFacade
  data: ReturnType<typeof registerData>
  render: ReturnType<typeof registerRender>
}

export async function bootEngine(opts: BootEngineOptions = {}): Promise<BootEngineResult> {
  const data = registerData(opts.data || {})
  const render = registerRender(opts.render || {})
  const engine = await initContentEngine()
  return { ok: true, engine, data, render }
}

export async function bootContentEngine(opts: BootEngineOptions = {}): Promise<BootEngineResult> {
  return bootEngine(opts)
}

export { initContentEngine, getEngine }
