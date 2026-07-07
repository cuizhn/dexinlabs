import { defineNuxtPlugin } from '#imports'
import { bootContentEngine } from '@modules/content/boot'
import { getEngine } from '@modules/content/core/engine'

export default defineNuxtPlugin(async (nuxtApp) => {
  await bootContentEngine()
  const engine = getEngine()

  nuxtApp.provide('contentEngine', engine)

  nuxtApp.hook('app:created', () => {
    if (!engine.isInitialized()) {
      console.warn('[content-engine] Engine hooks not fully initialized yet.')
    }
  })

  return {
    provide: {
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
