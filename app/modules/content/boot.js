import {
  registerSource,
  registerParser,
  registerTransformer,
  registerRenderer,
  registerQuery
} from '../core/registry'

import { createSource } from '../source'
import MarkdownParser from '../parser/markdown'
import HeadingTransformer from '../transformer/heading'
import TocTransformer from '../transformer/toc'
import LinksTransformer from '../transformer/links'
import ExcerptTransformer from '../transformer/excerpt'
import ReadingTimeTransformer from '../transformer/readingTime'
import ReferenceTransformer from '../transformer/reference'
import VueRenderer from '../renderer/vueRenderer'

export async function bootContentEngine() {
  registerParser('markdown', MarkdownParser, true)

  registerTransformer('heading', HeadingTransformer, 10)
  registerTransformer('toc', TocTransformer, 20)
  registerTransformer('links', LinksTransformer, 30)
  registerTransformer('excerpt', ExcerptTransformer, 40)
  registerTransformer('readingTime', ReadingTimeTransformer, 50)
  registerTransformer('reference', ReferenceTransformer, 100)

  registerRenderer('vue', VueRenderer, true)

  const defaultSource = createSource('database', {}, { name: 'neon-drizzle' })
  registerSource('database', defaultSource, true)

  const lazyQuery = buildLazyQueryFacade()
  registerQuery('default', lazyQuery, true)

  return {
    ok: true,
    registered: {
      parser: 'markdown',
      renderers: ['vue'],
      transformers: ['heading', 'toc', 'links', 'excerpt', 'readingTime', 'reference'],
      source: 'database'
    }
  }
}

function buildLazyQueryFacade() {
  return {
    async getCourse(slug, opts = {}) {
      const { loadCourse } = await import('../loader/course')
      return loadCourse(slug, opts)
    },

    async getChapter(slug, opts = {}) {
      const { loadChapter } = await import('../loader/chapter')
      return loadChapter(slug, opts)
    },

    async getLesson(slug, opts = {}) {
      const { loadLesson } = await import('../loader/lesson')
      return loadLesson(slug, opts)
    },

    async getExercise(slug, opts = {}) {
      const source = opts.source || (await import('../source')).then(m => {
        return m.createSource('database', {}, { name: 'lazy-db' })
      })
      return source.findOne('exercise', { slug })
    },

    async listChapters(opts = {}) {
      const { listChapters } = await import('../loader/chapter')
      return listChapters(opts)
    }
  }
}

export default bootContentEngine
