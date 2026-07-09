import { defineNuxtPlugin } from '#imports'
import { bootContentEngine } from '@boot'
import { getEngine } from '@core/engine'

export default defineNuxtPlugin(async (nuxtApp) => {
  await bootContentEngine()
  const engine = getEngine()

  nuxtApp.hook('app:created', () => {
    if (!engine.isInitialized()) {
      console.warn('[engine] Engine hooks not fully initialized yet.')
    }
  })

  return {
    provide: {
      engine,
      contentEngine: engine,
      contentQuery: {
        getChapter: (slug, opts) => engine.getChapter(slug, opts),
        getLesson: (slug, opts) => engine.getLesson(slug, opts),
        listChapters: (opts) => engine.listChapters(opts),
        renderContent: (raw, opts) => engine.renderContent(raw, opts)
      }
    }
  }
})
