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

// 引入 Markdown 数学公式解析插件
import remarkMath from 'remark-math'      // remark 插件：解析 Markdown 中的 LaTeX 数学语法（$...$ 和 $$...$$）
import rehypeKatex from 'rehype-katex'    // rehype 插件：将数学语法节点渲染为 KaTeX HTML

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  /**
   * Nuxt 模块注册
   * 这些模块会在应用启动时自动加载和初始化
   * - @nuxt/content: 内容管理模块，提供 Markdown 文件的查询和渲染能力
   */
  modules: [
    '@nuxt/content',
  ],

  /**
   * 开发者工具配置
   * enabled: true — 启用 Nuxt DevTools，方便开发调试
   */
  devtools: { enabled: true },

  /**
   * 兼容性日期
   * 用于确定 Nuxt 的行为兼容性版本，避免破坏性变更影响项目
   */
  compatibilityDate: '2024-04-03',

  /**
   * 全局 CSS 样式
   * 按顺序加载，后面的样式可覆盖前面的
   * - katex/dist/katex.min.css: KaTeX 数学公式渲染所需的样式表
   * - ~/assets/css/main.css: 项目自定义全局样式
   */
  css: [
    'katex/dist/katex.min.css',   // KaTeX 数学公式样式（必须在自定义样式之前加载）
    '~/assets/css/main.css',       // 项目主样式文件
  ],

  /**
   * 应用级配置
   * 配置 HTML <head> 中的全局内容
   */
  app: {
    head: {
      title: 'Edu Platform',  // 默认页面标题（可被页面级 useHead 覆盖）
      meta: [
        { charset: 'utf-8' },                                      // 字符编码
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },  // 移动端视口适配
      ],
      link: [
        {
          rel: 'stylesheet',
          // 引入 Google Fonts：Inter（UI 字体）和 JetBrains Mono（等宽/代码字体）
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  /**
   * 组件自动导入目录
   * Nuxt 会自动扫描这些目录下的 .vue 文件并注册为全局组件
   * - ~/components: 项目组件目录
   */
  components: {
    dirs: [
      {
        path: '~/components',
        //pathPrefix: false,  // 忽略子目录前缀，AppHeader.vue 直接注册为 <AppHeader>，而非 <CommonAppHeader>
      },
    ],
  },

  /**
   * Nuxt Content 模块配置
   * 控制 Markdown 内容的解析和渲染行为
   */
  content: {
    experimental: {
      sqliteConnector: true,  // 启用 SQLite 连接器（实验性功能），用于本地内容数据库
    },
    markdown: {
      // remark 插件：在 Markdown 解析阶段处理语法树
      remarkPlugins: [
        remarkMath,  // 识别 $...$ 和 $$...$$ 数学公式语法，生成数学节点
      ],
      // rehype 插件：在 HTML 生成阶段处理渲染
      rehypePlugins: [
        [rehypeKatex, { output: 'html' }],  // 将数学节点渲染为 KaTeX HTML，output: 'html' 指定输出为 HTML 而非 MathML
      ],
    },
  },

  /**
   * Vite 构建工具配置
   * 优化开发体验和构建性能
   */
  vite: {
    optimizeDeps: {
      // 预构建依赖项列表
      // 将这些包提前打包，避免开发时的按需加载导致页面加载缓慢
      include: [
        'katex',  // KaTeX 数学公式渲染库，体积较大需要预构建
      ],
    },
  },
})
