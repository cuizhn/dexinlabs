/**
 * GET /api/lesson/[slug] - 课时详情 API 端点
 * 
 * 设计意图：
 * =========
 * 提供单个课时详细信息的 RESTful API 接口。
 * 
 * 为什么使用 Nitro/h3 框架？
 * =======================
 * 1. **Nuxt 兼容**：与 Nuxt 3 无缝集成，共享同一服务端运行时
 * 2. **类型安全**：基于 TypeScript，提供完整的类型支持
 * 3. **轻量级**：h3 是一个轻量级的 HTTP 框架，性能优秀
 * 4. **自动路由**：文件系统路由，无需手动配置
 * 
 * 替代方案对比：
 * =============
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | **Nitro/h3** | Nuxt 兼容，自动路由 | 生态相对较小 |
 * | Express | 生态成熟，文档完善 | 需要手动配置路由 |
 * | Fastify | 性能优秀，Schema 验证 | 学习曲线较陡 |
 * 
 * 本方案优势：
 * ===========
 * - **零配置**：文件系统路由，无需手动注册
 * - **Nuxt 集成**：与 Nuxt 共享服务端逻辑
 * - **类型安全**：完整的 TypeScript 支持
 * 
 * URL 参数：
 * =========
 * - slug: 课时的唯一标识（必需）
 * 
 * 响应：
 * =====
 * - 200 OK: 返回课时页面数据（包含章节、课程、上一/下一课时）
 * - 400 Bad Request: slug 参数缺失
 * - 404 Not Found: 课时不存在
 */
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { getContentEngine } from '@ce'

export default defineEventHandler(async event => {
  /** 从 URL 路由参数中提取 slug */
  const slug = getRouterParam(event, 'slug')

  /** 如果 slug 为空，返回 400 错误 */
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  /** 获取 Content Engine 实例（延迟初始化） */
  const engine = getContentEngine()
  
  /** 获取课时页面数据 */
  const result = await engine.getLessonPage(slug)

  /** 如果课时不存在，返回 404 错误 */
  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: `Lesson not found: ${slug}`
    })
  }

  /** 返回课时页面数据 */
  return result
})
