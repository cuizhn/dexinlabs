/**
 * nuxt.config.ts - Nuxt 配置文件
 * 
 * 设计意图：
 * =========
 * 配置 Nuxt 框架的全局参数，包括应用入口、样式、路由、别名等。
 * 
 * 为什么使用 Nuxt？
 * ===============
 * 1. **服务端渲染**：内置 SSR 支持，提升 SEO 和首屏加载速度
 * 2. **零配置**：自动路由、自动导入、自动代码分割
 * 3. **Vue 3 集成**：与 Vue 3 无缝集成，支持组合式 API
 * 4. **插件系统**：灵活的插件机制，支持服务端和客户端插件
 * 5. **TypeScript**：完整的 TypeScript 支持
 * 
 * 替代方案对比：
 * =============
 * | 框架 | 优点 | 缺点 |
 * |------|------|------|
 * | **Nuxt** | SSR 支持，零配置，Vue 3 集成 | 学习曲线较陡 |
 * | Next.js | 生态成熟，文档完善 | React 生态，不支持 Vue |
 * | Vite + Vue | 简单灵活 | 需要手动配置 SSR |
 * 
 * 本方案优势：
 * ===========
 * - **SSR 支持**：内置服务端渲染，提升 SEO
 * - **零配置路由**：文件系统路由，无需手动配置
 * - **自动导入**：Vue 组件和 composables 自动导入
 * - **类型安全**：完整的 TypeScript 支持
 * - **插件系统**：灵活的插件机制
 * 
 * 配置说明：
 * =========
 * - srcDir: 应用源码目录
 * - devtools: 是否启用开发者工具
 * - compatibilityDate: 兼容性日期
 * - css: 全局 CSS 文件
 * - app.head: HTML head 配置
 * - components.dirs: 组件目录
 * - imports.dirs: 自动导入目录
 * - alias: 路径别名配置
 * - vite: Vite 配置
 */
import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

/** 当前文件的绝对路径 */
const __filename = fileURLToPath(import.meta.url)

/** 当前文件所在目录的绝对路径 */
const __dirname = path.dirname(__filename)

/** 项目根目录的绝对路径 */
const rootDir: string = __dirname

/** 导出 Nuxt 配置 */
export default defineNuxtConfig({
  /** 应用源码目录 */
  srcDir: 'app/',

  /** 是否启用开发者工具 */
  devtools: { enabled: true },

  /** 兼容性日期（用于 Nuxt 的 Breaking Change 管理） */
  compatibilityDate: '2024-04-03',

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
    '@shared': path.resolve(rootDir, 'app/shared'),
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

  vite: {
    optimizeDeps: {
      include: ['katex']
    }
  }
})
