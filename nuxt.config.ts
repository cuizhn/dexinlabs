import { defineNuxtConfig } from "nuxt/config";

/**
 * Nuxt 应用配置文件
 *
 * Dexin Labs（得心实验室）数学教育平台
 * 核心架构：Page → Composable → Repository → Server API → Nuxt Content
 * 技术栈：Nuxt 4 + Vue 3 + TypeScript + Nuxt Content v3 + KaTeX
 */
export default defineNuxtConfig({
  modules: ['@nuxt/content'],

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
          content:
            '理解为先，应用为本。让学习真正得心应手。Dexin Labs — K12 数学思维学习平台。',
        },
      ],
      link: [
        {
          rel: 'stylesheet',
          href:
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  components: {
    dirs: [{ path: '~/components' }],
  },

  content: {
    experimental: {
      sqliteConnector: true,
    },
    build: {
      markdown: {
        remarkPlugins: {
          'remark-math': {},
        },
        rehypePlugins: {
          'rehype-katex': {},
        },
      },
    },
  },

  vite: {
    optimizeDeps: {
      include: ['katex'],
    },
  },
})
