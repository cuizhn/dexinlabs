/**
 * Nuxt 应用配置文件
 *
 * 功能说明：
 * 本文件是 Nuxt 应用的核心配置文件，定义了应用的基础设施和各项功能配置。
 * 主要配置项包括：
 * - 模块注册（Nuxt Content 内容管理模块）
 * - 全局 CSS 样式引入（KaTeX 数学公式样式、自定义主样式）
 * - 应用 HTML Head 配置（标题、元信息、字体引入）
 * - 组件目录配置
 * - Nuxt Content 模块配置（Markdown 插件、数据库连接器）
 * - Vite 构建工具优化配置
 */
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

export default defineNuxtConfig({
  /**
   * Nuxt modules
   */
  modules: [
    '@nuxt/content',
  ],

  /**
   * Devtools
   */
  devtools: { enabled: true },

  /**
   * Compatibility
   */
  compatibilityDate: '2024-04-03',

  /**
   * Global CSS
   */
  css: [
    'katex/dist/katex.min.css',
    '~/assets/css/main.css',
  ],

  /**
   * App head
   */
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
          href:
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  /**
   * Components
   */
  components: {
    dirs: [
      {
        path: '~/components',
      },
    ],
  },

  /**
   * Nuxt Content
   */
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

  /**
   * Vite
   */
  vite: {
    optimizeDeps: {
      include: ['katex'],
    },
  },
})