// ============================================================
// 【文件定位】nuxt.config.ts
//  作用：Nuxt 应用根配置文件（项目级核心配置）
//  读取时机：Nuxt 进程启动（nuxi dev / nuxi build）时第一时间读取并加载
//  配置目标：声明模块、设置源码目录、全局 CSS、SEO head、Content 构建参数、Vite 优化等
//  defineNuxtConfig：类型安全包装函数，帮助 TypeScript 推断配置字段类型并提供 IDE 补全
// ============================================================

// ============================================================
// 【依赖导入】defineNuxtConfig
//  来源：nuxt/config（Nuxt 框架官方类型模块）
//  作用：包装配置对象，返回带类型注解的对象，在 Nuxt 加载时合并默认值 + 用户配置
// ============================================================
import { defineNuxtConfig } from "nuxt/config";

/**
 * Nuxt 应用配置文件
 *
 * Dexin Labs（得心实验室）数学教育平台
 * 核心架构：Page → Composable → Repository → Server API → Nuxt Content
 * 技术栈：Nuxt 4 + Vue 3 + TypeScript + Nuxt Content v3 + KaTeX
 */

// ============================================================
// 【顶层导出 defineNuxtConfig】默认导出 Nuxt 配置对象
//  各顶层 key 一览（以下按顺序逐一解释）：
//    modules           — Nuxt 扩展模块数组（如 @nuxt/content）
//    srcDir            — 应用源码根目录（指向 app/）
//    devtools          — Nuxt DevTools 开关
//    compatibilityDate — Nuxt 破坏性变更兼容日期（锁版本行为）
//    css               — 全局注入 CSS 数组（每个元素是一条样式路径）
//    app               — 应用级 head 等设置（全局 HTML meta/link/title）
//    components        — 自动扫描组件目录配置
//    content           — @nuxt/content 模块专属配置
//    vite              — Vite 构建引擎专属配置（预构建优化等）
// ============================================================
export default defineNuxtConfig({
  // ============================================================
  // 【顶层 key: modules】Nuxt 模块数组
  //  类型：Array<string | [string, ModuleOptions]>
  //  作用：声明并加载 Nuxt 扩展模块，每个模块会向 Nuxt 注入功能、钩子、自动导入等
  // ----------
  //  本项目模块：'@nuxt/content'
  //  @nuxt/content 带来的功能：
  //    ① 文件驱动内容层：扫描 content/ 目录的 .md/.yml/.json/.csv 文件，转为可查询内容集合
  //    ② Content 自动导入组件：<ContentRenderer>、<ContentDoc>、<ContentList> 等无需 import
  //    ③ 自动导入 composable：queryContent()、queryCollection() 在页面/组件中直接使用
  //    ④ Markdown 构建管道：内置 remark/rehype 插件系统（数学公式、代码高亮、锚点链接）
  //    ⑤ 内容查询 API：where() / order() / sort() / limit() / first() / all() 链式调用
  //    ⑥ Server API：自动暴露 /api/_content/... 接口供 SSR/CSR 查询内容
  //    ⑦ MDC 语法：Markdown 组件化（在 .md 中使用 Vue 组件）
  //    ⑧ collections：本项目通过 content.config.ts 定义 3 个集合（chapter / lesson / exercise）
  // ============================================================
  modules: ['@nuxt/content'],

  // ============================================================
  // 【顶层 key: srcDir】应用源码根目录
  //  类型：string
  //  默认值：'/'（项目根目录）
  //  当前值：'app/' — 所有 Nuxt 业务源码放在 app/ 子目录中
  // ----------
  //  srcDir 指向 app/ 的作用：
  //    ① 目录分层清晰：项目根目录放配置（nuxt.config.ts / tsconfig.json / package.json）
  //       content/ 资源 / docs / public 等，与业务源码 app/ 解耦
  //    ② Nuxt 仅扫描 app/ 下的约定目录：
  //       app/pages/      →  自动注册路由（Nuxt 文件路由约定）
  //       app/components/ →  自动注册组件（配合 components.dirs 配置）
  //       app/composables/ → 自动导入组合式函数（useChapter / useLesson 等）
  //       app/middleware/ →  路由中间件
  //       app/plugins/    →  插件
  //       app/layouts/    →  布局
  //       app/assets/     →  静态资源（CSS/图片等，~ 别名指向 app/）
  //    ③ 别名 ~ / @ / ~~ / @@：Nuxt 自动将 ~ 解析为 app/（而不是根目录）
  //       例如 '~/assets/css/main.css' → 'app/assets/css/main.css'
  // ============================================================
  srcDir: 'app/',

  // ============================================================
  // 【顶层 key: devtools】Nuxt DevTools 开关
  //  类型：{ enabled: boolean }
  //  enabled = true：开发模式下在页面右下角显示 Nuxt 官方 DevTools 面板入口
  //    面板功能：组件树、路由、自动导入清单、Content 查询、性能分析等
  //  生产构建（nuxi build）中此配置不生效（DevTools 自动剥离）
  // ============================================================
  devtools: { enabled: true },

  // ============================================================
  // 【顶层 key: compatibilityDate】兼容锁定日期
  //  类型：string（YYYY-MM-DD 格式）
  //  作用：Nuxt/Nitro 会根据此日期决定是否启用/禁用某些破坏性变更的新行为
  //    类似于 lockfile，避免更新 Nuxt 版本后项目行为意外变化
  //    设置后，即使未来升级 Nuxt，也会保持该日期前的默认配置行为
  //  当前值：'2024-04-03' — 锁定 2024年4月3日 之前的默认行为
  // ============================================================
  compatibilityDate: '2024-04-03',

  // ============================================================
  // 【顶层 key: css】全局注入 CSS 数组
  //  类型：Array<string>
  //  作用：每个元素是一条 CSS 文件路径，Nuxt 会在每个页面的 <head> 中通过 <link rel="stylesheet"> 注入
  //        （构建时也会被 Vite 打包去重、压缩）
  // ----------
  //  CSS 数组每条来源路径解释：
  //    ① 'katex/dist/katex.min.css'
  //        来源：node_modules/katex/dist/katex.min.css
  //        用途：KaTeX 数学公式渲染库的核心样式（字体、符号、布局）
  //        加载原因：Markdown 中的 $...$ / $$...$$ 数学公式由 rehype-katex 转换为 HTML 后，
  //                  必须依赖此 CSS 文件才能正确渲染分数、上下标、积分等数学符号
  //    ② '~/assets/css/main.css'
  //        来源：app/assets/css/main.css（因为 srcDir = 'app/'，~ 指向 app/）
  //        用途：项目全局自定义样式（CSS 变量 --color-primary、.container、字体、重置样式等）
  //        加载原因：全站使用的设计令牌（Design Token）和工具类必须在每个页面都生效
  // ============================================================
  css: ['katex/dist/katex.min.css', '~/assets/css/main.css'],

  // ============================================================
  // 【顶层 key: app】应用级全局设置
  //  子键：
  //    head — 全局 HTML <head> 默认元信息（每个页面未显式覆盖时使用此默认值）
  // ============================================================
  app: {
    // app.head：全局默认 head 配置，被 useHead() / useSeoMeta() 按页面粒度覆盖
    head: {
      // title：浏览器标签栏默认标题（未设置页面级 title 时显示）
      title: 'Dexin Labs | 得心实验室',
      // htmlAttrs：<html> 标签属性，lang 设置页面语言为简体中文（影响搜索引擎抓取、无障碍朗读）
      htmlAttrs: { lang: 'zh-CN' },
      // meta：<meta> 标签数组，依次声明字符编码、视口、SEO 描述
      meta: [
        // charset：UTF-8 字符编码，浏览器正确渲染中文
        { charset: 'utf-8' },
        // viewport：移动端响应式视口（宽度 = 设备宽度，初始缩放 1）
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // description：SEO 页面描述，搜索引擎 SERP 展示用
        {
          name: 'description',
          content:
            '理解为先，应用为本。让学习真正得心应手。Dexin Labs — K12 数学思维学习平台。',
        },
      ],
      // link：<link> 标签数组，加载 Google Fonts 远程字体样式表
      link: [
        // 字体：Inter（英文 sans-serif） + Noto Sans SC（中文 sans-serif） + JetBrains Mono（等宽代码）
        // weights 400/500/600/700/800 覆盖 Regular → Extra Bold 全字重
        {
          rel: 'stylesheet',
          href:
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  // ============================================================
  // 【顶层 key: components】自动注册组件配置
  //  子键 dirs：扫描目录数组，每个对象指定一个组件根目录
  //    { path: '~/components' } →  扫描 app/components/ 下所有子目录中的 .vue 文件
  //  自动注册规则（Nuxt 内置）：
  //    ① 文件路径去掉前缀后 PascalCase 作为组件名
  //      例如 app/components/course/ChapterNav.vue →  注册名 <ChapterNav>
  //    ② 无需在页面中 import 即可使用标签
  //    ③ 支持子目录嵌套：app/components/home/HomeFeatureGrid.vue →  <HomeFeatureGrid>
  //  pathPrefix: false（默认 true，若 pathPrefix=true 则 <CourseChapterNav>）
  // ============================================================
  components: {
    dirs: [{ path: '~/components' }],
  },

  // ============================================================
  // 【顶层 key: content】@nuxt/content 模块专属配置
  //  与 content.config.ts 的区别：
  //    content.config.ts  —  定义 collections（集合、schema、数据源路径）
  //    nuxt.config.ts content  —  配置模块行为（构建插件、实验特性、SQLite 连接器等）
  // ----------
  //  content 子键概览：
  //    experimental —  实验性特性开关
  //    build        —  构建阶段配置（Markdown 插件管道）
  // ============================================================
  content: {
    // content.experimental：实验性特性（Beta/Preview，可能后续版本变更 API）
    experimental: {
      // experimental.sqliteConnector：SQLite 内容连接器开关
      //  仅在开发环境开启：process.env.NODE_ENV !== 'production'
      //  true 的作用（开发阶段）：
      //    构建阶段，@nuxt/content 将所有内容集合（chapter/lesson/exercise）写入本地 SQLite 数据库
      //    查询性能：queryCollection() 走 SQLite 索引查询，比默认的内存/JSON 文件扫描更快
      //               大数据量（>1000 条内容）时差异明显
      //    适用场景：集合数据量大、复杂 where/order/join 查询
      //  false 的原因（生产部署，尤其是 Vercel Serverless）：
      //    Vercel/Netlify 等 Serverless Functions 的文件系统是只读的（仅 /tmp 可写）
      //    构建期生成的 SQLite db 在运行时函数冷启动时路径不稳定，易 queryCollection 失败
      //    生产环境使用默认的内存查询索引即可（当前 chapter/lesson/exercise 仅几十条，性能无忧）
      //  注意：实验性特性，未来版本可能调整配置名或行为
      sqliteConnector: process.env.NODE_ENV !== 'production',
    },
    // content.build：构建阶段内容处理配置
    build: {
      // build.markdown：Markdown 文件构建管道配置
      markdown: {
        // markdown.remarkPlugins：Remark 插件配置（Markdown 解析阶段插件）
        //  Remark 生态 =  处理 Markdown AST（MDAST），在 Markdown → HTML 前修改语法树
        //  配置格式：Record<插件名, 插件选项对象>
        remarkPlugins: {
          // 插件 'remark-math'：识别 Markdown 中的数学公式语法
          //   行内公式：$E = mc^2$
          //   块级公式：$$\int_0^1 f(x)dx$$
          //   作用：将 $...$ 和 $$...$$ 包裹的内容标记为数学节点，供后续 rehype-katex 渲染
          //   选项对象 {}：使用默认配置（无自定义宏、无自定义分隔符）
          'remark-math': {},
        },
        // markdown.rehypePlugins：Rehype 插件配置（HTML 处理阶段插件）
        //  Rehype 生态 =  处理 HTML AST（HAST），在 Markdown 转 HTML 后修改 HTML 树
        rehypePlugins: {
          // 插件 'rehype-katex'：调用 KaTeX 引擎渲染数学公式为 HTML+SVG
          //   依赖：需要 remark-math 先标记数学节点，再由本插件把节点替换为 KaTeX 输出的 HTML
          //   样式依赖：需同时加载 katex/dist/katex.min.css（见 css 数组第一条）
          //   优势：KaTeX 渲染速度快，服务端也能正确输出（MathJax 通常需客户端 DOM 就绪）
          //   选项对象 {}：使用默认配置（默认字体大小、无自定义宏等）
          'rehype-katex': {},
        },
      },
    },
  },

  // ============================================================
  // 【顶层 key: nitro】Nitro 服务端引擎配置（Nuxt 4 底层运行时 = Nitro）
  //  作用：控制服务端渲染、API 路由、部署目标平台的打包格式
  // ----------
  //  nitro.preset：部署目标预设（Preset），决定 Nitro 构建产物的格式
  //  可选值参考：'node-server'（默认）、'vercel'、'netlify'、'cloudflare'、'static' 等
  //  当前值：'vercel'
  //  为什么必须是 vercel：
  //    Vercel 部署时，Nitro 需要将：
  //      ① 页面 SSR → 打包为 Vercel Serverless Functions（.vercel/output/functions/*.func）
  //      ② Server API（/api/chapter 等）→ 打包为同名 Vercel Functions
  //      ③ 静态资源 → 输出到 .vercel/output/static/
  //    如果 preset 保持默认 node-server，Vercel 会启动失败、无 Functions、500 错误或白屏
  //  注意：Vercel 检测到 Nuxt 4 项目时会自动在 CI 中设置 NITRO_PRESET=vercel 环境变量，
  //        此处显式配置可兜底（防止 auto-detect 失效或本地 build 部署产物上传场景）
  //  nitro.esbuild.options：为了兼容 Vercel Node 20 runtime，设置 target 为 node20（可按需追加）
  // ============================================================
  nitro: {
    preset: 'vercel',
  },

  // ============================================================
  // 【顶层 key: vite】Vite 构建引擎配置（Nuxt 4 底层使用 Vite）
  //  子键 optimizeDeps：Vite 依赖预构建（optimizeDeps）配置
  //    预构建的作用：开发模式下，将 CommonJS / 多入口 ESM 依赖预先打包为单文件 ESM，
  //    减少浏览器请求数 + 提升冷启动 / HMR 速度
  // ============================================================
  vite: {
    // optimizeDeps.include：强制预构建的依赖清单（数组）
    //  作用：某些依赖未被 Vite 自动扫描到（例如通过动态 import 间接引用），
    //        或首屏加载时触发大量子请求，需要手动加入 include 强制预构建
    //  当前值：['katex'] —  将 KaTeX 库强制加入预构建
    //  原因：KaTeX 在开发模式下子模块较多，客户端加载会触发多个请求，
    //        预构建后合并为一个模块，HMR 更快
    optimizeDeps: {
      include: ['katex'],
    },
  },
})
