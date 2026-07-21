/**
 * Nuxt 配置文件
 *
 * 配置 Nuxt 框架的全局参数，包括应用入口、样式、路由、路径别名等。
 */
import { defineNuxtConfig } from 'nuxt/config'
import path from 'node:path'

/** 项目根目录的绝对路径（Node 22+ 原生支持 import.meta.dirname） */
const rootDir: string = import.meta.dirname!

/** 导出 Nuxt 配置 */
export default defineNuxtConfig({
  /** 应用源码目录 */
  srcDir: 'app/',

  /** Nuxt 模块 */
  modules: ['@nuxt/eslint'],

  /** 是否启用开发者工具 */
  devtools: { enabled: true },

  /** 兼容性日期（用于 Nuxt 的 Breaking Change 管理，需与当前 Nuxt 大版本匹配） */
  compatibilityDate: '2025-05-01',

  /** 全局 CSS 文件 */
  css: ['katex/dist/katex.min.css', '~/assets/css/main.css'],

  /** 应用配置 */
  app: {
    /** HTML head 配置 */
    head: {
      /** 页面标题 */
      title: 'Dexin Labs | 得心实验室',

      /** HTML 属性 */
      htmlAttrs: { lang: 'zh-CN' },

      /** Meta 标签 */
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: '理解为先，应用为本。让学习真正得心应手。Dexin Labs — K12 数学思维学习平台。'
        }
      ],

      /** 外部资源链接 */
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap'
        }
      ]
    }
  },

  /** 组件配置 */
  components: {
    dirs: [
      { path: '~/components' }
    ]
  },

  /** 自动导入配置 */
  imports: {
    dirs: [
      '~/composables'
    ]
  },

  /** 路径别名配置 */
  alias: {
    '@server': path.resolve(rootDir, 'server'),
    '@markdown': path.resolve(rootDir, 'app/markdown'),
    '@content': path.resolve(rootDir, 'app/content'),
    '@database': path.resolve(rootDir, 'app/database')
  },

  /** 
   * Vercel 预设（注释掉，可根据部署环境启用）
   * nitro: {
   *   preset: 'vercel'
   * },
   */

  /** Vite 构建配置 */
  vite: {
    optimizeDeps: {
      /** KaTeX 包含大量内部模块，预构建可避免开发时页面刷新 */
      include: ['katex']
    }
  }
})
