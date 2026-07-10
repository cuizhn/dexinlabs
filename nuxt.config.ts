import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir: string = __dirname

export default defineNuxtConfig({
  srcDir: 'app/',

  devtools: { enabled: true },

  compatibilityDate: '2024-04-03',

  css: ['katex/dist/katex.min.css', '~/assets/css/main.css'],

  app: {
    head: {
      title: 'Dexin Labs | 得心实验室',

      htmlAttrs: { lang: 'zh-CN' },

      meta: [
        { charset: 'utf-8' },

        { name: 'viewport', content: 'width=device-width, initial-scale=1' },

        {
          name: 'description',
          content: '理解为先，应用为本。让学习真正得心应手。Dexin Labs — K12 数学思维学习平台。'
        }
      ],

      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap'
        }
      ]
    }
  },

  components: {
    dirs: [
      { path: '~/components' }
    ]
  },

  imports: {
    dirs: [
      '~/composables'
    ]
  },

  alias: {
    '@shared': path.resolve(rootDir, 'app/shared'),
    '@server': path.resolve(rootDir, 'server'),
    '@core': path.resolve(rootDir, 'app/core'),
    '@me': path.resolve(rootDir, 'app/core/markdown-engine/src'),
    '@ce': path.resolve(rootDir, 'app/core/content-engine')
  },

  // nitro: {
  //   preset: 'vercel'
  // },

  vite: {
    optimizeDeps: {
      include: ['katex']
    },

    resolve: {
      alias: {
        '@shared': path.resolve(rootDir, 'app/shared'),
        '@server': path.resolve(rootDir, 'server'),
        '@core': path.resolve(rootDir, 'app/core'),
        '@me': path.resolve(rootDir, 'app/core/markdown-engine/src'),
        '@ce': path.resolve(rootDir, 'app/core/content-engine')
      }
    }
  }
})
