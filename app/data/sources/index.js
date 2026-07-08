import DatabaseSource from './database/DatabaseSource'

export { DatabaseSource }

export function createSource(type, deps = {}, opts = {}) {
  switch (type) {
    case 'database':
    case 'neon':
    case 'neon-drizzle':
    case 'markdown':
    case 'filesystem':
      return new DatabaseSource(deps.connection || deps, opts)
    default:
      throw new Error(
        `[createSource] Unknown source type: ${type}. ` +
        `Supported: database | neon | neon-drizzle`
      )
  }
}

export const SOURCE_TYPES = {
  MARKDOWN: 'database',
  DATABASE: 'database',
  NEON: 'neon',
  NEON_DRIZZLE: 'neon-drizzle'
}

export default { createSource, SOURCE_TYPES }
