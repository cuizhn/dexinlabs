/**
 * engine.client.js - 客户端 Nuxt 插件
 * 
 * 设计意图：
 * =========
 * 在客户端初始化 Content Engine 和 Markdown Engine，并通过 Nuxt 插件系统注入到全局上下文中。
 * 
 * 为什么需要客户端插件？
 * ====================
 * 1. **初始化引擎**：确保客户端代码可以访问 Content Engine 和 Markdown Engine
 * 2. **全局注入**：通过 Nuxt 的 provide 机制，在组件中可以直接使用 `$content`, `$markdown` 等
 * 3. **服务端兼容**：与 engine.server.js 配合，确保 SSR 和客户端渲染的一致性
 * 
 * 为什么使用 Nuxt 插件？
 * ===================
 * 1. **生命周期管理**：Nuxt 插件在应用启动时自动执行
 * 2. **依赖注入**：通过 provide 机制实现依赖注入
 * 3. **类型支持**：Nuxt 自动推断注入的类型
 * 
 * 替代方案对比：
 * =============
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | **Nuxt 插件** | 生命周期管理，全局注入，类型支持 | 需要理解 Nuxt 插件机制 |
 * | 手动初始化 | 简单直接 | 需要在每个组件中手动导入 |
 * | Vue 插件 | 全局注册 | 与 Nuxt 生命周期不完全兼容 |
 * 
 * 本方案优势：
 * ===========
 * - **全局可用**：通过 `$content`, `$markdown` 等全局变量访问
 * - **类型安全**：Nuxt 自动推断注入的类型
 * - **统一初始化**：在插件中统一初始化所有引擎
 * - **SSR 兼容**：与服务端插件配合使用
 * 
 * 注入的全局变量：
 * ==============
 * - $content: Content Engine 实例
 * - $markdown: Markdown Engine 实例
 * - $services: 业务服务集合（chapter, lesson, course, exercise）
 * - $repositories: 数据访问层集合（chapter, lesson, course, exercise, asset）
 * - $queries: 查询参数规范化工具
 * - $renderToHTML: Markdown 转 HTML 渲染函数
 * - $renderToVNode: Markdown 转 VNode 渲染函数
 * 
 * 使用方式：
 * ========
 * // 在组件中使用
 * const content = useNuxtApp().$content
 * const html = useNuxtApp().$renderToHTML('# Hello')
 */
import { defineNuxtPlugin } from '#imports'
import {
  getContentEngine,
  chapterService,
  lessonService,
  courseService,
  exerciseService,
  chapterRepository,
  lessonRepository,
  courseRepository,
  exerciseRepository,
  assetRepository,
  queries
} from '@ce'
import {
  getEngine as getMarkdownEngine,
  renderToHTML,
  renderToVNode
} from '@me'

/**
 * 定义 Nuxt 插件
 * 
 * 实现逻辑：
 * ========
 * 1. 尝试导入数据库模块（忽略错误，因为客户端可能没有数据库）
 * 2. 获取 Content Engine 实例
 * 3. 获取 Markdown Engine 实例
 * 4. 组织服务和仓库集合
 * 5. 通过 provide 注入到全局上下文
 */
export default defineNuxtPlugin(async () => {
  /** 尝试导入数据库模块（客户端可能不需要） */
  await import('@core/database').catch(() => {})
  
  /** 获取 Content Engine 实例 */
  const content = getContentEngine()
  
  /** 获取 Markdown Engine 实例 */
  const markdown = getMarkdownEngine()
  
  /** 组织业务服务集合 */
  const services = {
    chapter: chapterService,
    lesson: lessonService,
    course: courseService,
    exercise: exerciseService
  }
  
  /** 组织数据访问层集合 */
  const repositories = {
    chapter: chapterRepository,
    lesson: lessonRepository,
    course: courseRepository,
    exercise: exerciseRepository,
    asset: assetRepository
  }
  
  /** 注入到全局上下文 */
  return {
    provide: {
      content,
      markdown,
      services,
      repositories,
      queries,
      renderToHTML,
      renderToVNode
    }
  }
})
