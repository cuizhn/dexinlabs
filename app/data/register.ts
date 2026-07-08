import { registerSource, registerQuery } from '@core/registry'
import { createSource } from './sources/index.js'
import { buildLazyQueryFacade } from './queries/lazyQuery.js'
import type { SourceContract, QueryContract } from '@core/contracts/data.js'

interface RegisterDataOptions {
  sourceName?: string
  sourceOptions?: Record<string, unknown>
  query?: QueryContract
  [key: string]: unknown
}

interface RegisterDataResult {
  source: string
  query: string
}

export function registerData(opts: RegisterDataOptions = {}): RegisterDataResult {
  const sourceName = opts.sourceName || 'neon-drizzle'
  const source = createSource('database', opts.sourceOptions || {}, { name: sourceName }) as SourceContract

  registerSource('database', source, true)
  registerSource(sourceName, source, false)

  const query = opts.query || (buildLazyQueryFacade() as QueryContract)
  registerQuery('default', query, true)

  return {
    source: sourceName,
    query: 'default'
  }
}

export default registerData
