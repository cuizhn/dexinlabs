/**
 * GET /api/course - 课程 API 端点
 * 
 * 设计意图：
 * =========
 * 提供课程数据的 RESTful API 接口，支持按 slug 查询特定课程或获取默认课程。
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
 * 请求参数：
 * =========
 * - slug (可选): 课程的唯一标识
 * 
 * 响应：
 * =====
 * - 如果提供 slug 且找到课程：返回课程页面数据
 * - 如果提供 slug 但未找到：返回默认课程
 * - 如果未提供 slug：返回默认课程
 */
import { defineEventHandler, getQuery } from 'h3'
import { getContentEngine } from '@content'

export default defineEventHandler(async event => {
  /** 获取 URL 查询参数 */
  const query = getQuery(event)
  /** 提取 slug 参数，默认为空字符串 */
  const slug = String(query.slug || '')

  /** 获取 Content Engine 实例（延迟初始化） */
  const engine = getContentEngine()

  /** 如果提供了 slug，尝试获取特定课程 */
  if (slug) {
    const result = await engine.getCoursePage(slug)
    if (result) return result
  }

  /** 返回默认课程 */
  return engine.getDefaultCourse()
})
