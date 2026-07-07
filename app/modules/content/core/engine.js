import { runPipeline } from './pipeline'
import { getQuery, getSource, getParser, getRenderer } from './registry'

const __engine_state = {
  initialized: false
}

export async function initContentEngine(bootFn = null) {
  if (__engine_state.initialized) return getEngine()

  if (typeof bootFn === 'function') {
    await bootFn()
  }

  __engine_state.initialized = true
  return getEngine()
}

export function getEngine() {
  return {
    query: (name = null) => getQuery(name),
    source: (name = null) => getSource(name),
    parser: (name = null) => getParser(name),
    renderer: (name = null) => getRenderer(name),

    async pipe(content, opts = {}) {
      return runPipeline(content, opts)
    },

    async getChapter(slug, opts = {}) {
      const q = getQuery()
      if (!q) throw new Error('[Engine] No Query registered. Call initContentEngine with registerQuery first.')
      return q.getChapter(slug, opts)
    },

    async getLesson(slug, opts = {}) {
      const q = getQuery()
      if (!q) throw new Error('[Engine] No Query registered.')
      return q.getLesson(slug, opts)
    },

    async listChapters(opts = {}) {
      const q = getQuery()
      if (!q) throw new Error('[Engine] No Query registered.')
      return q.listChapters(opts)
    },

    async renderContent(content, opts = {}) {
      return runPipeline(content, opts)
    },

    isInitialized() {
      return __engine_state.initialized
    }
  }
}

export const ContentEngine = getEngine()

export default ContentEngine
