import DatabaseSource from './database/DatabaseSource'
import CMSource from './cms/CMSSource'

export { DatabaseSource, CMSource }

export function createSource(type, deps = {}, opts = {}) {
  switch (type) {
    case 'nuxt-content-v3':
    case 'markdown':
    case 'filesystem':
    case 'database':
    case 'neon':
    case 'prisma':
      return new DatabaseSource(deps.connection || deps, opts)
    case 'cms':
      return new CMSource(deps.api || deps, opts)
    default:
      throw new Error(
        `[createSource] Unknown source type: ${type}. ` +
        `Supported: database | neon | prisma | cms`
      )
  }
}

export const SOURCE_TYPES = {
  NUXT_CONTENT_V3: 'database',
  MARKDOWN: 'database',
  DATABASE: 'database',
  NEON: 'neon',
  PRISMA: 'prisma',
  CMS: 'cms'
}

export default { createSource, SOURCE_TYPES }
