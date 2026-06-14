import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
  ],

  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',

  css: [
    'katex/dist/katex.min.css',
    '~/assets/css/main.css',
  ],

  app: {
    head: {
      title: 'Edu Platform',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  components: {
    dirs: [
      '~/components',
    ],
  },

  content: {
    experimental: {
      sqliteConnector: true,
    },
    markdown: {
      remarkPlugins: [
        remarkMath,
      ],
      rehypePlugins: [
        [rehypeKatex, { output: 'html' }],
      ],
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        'katex',
      ],
    },
  },
})
