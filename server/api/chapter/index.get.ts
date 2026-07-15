/**
 * GET /api/chapter - 章节列表 API 端点
 * 
 * 设计意图：
 * =========
 * 提供章节列表的 RESTful API 接口，支持按课程过滤。
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
 * - course (可选): 课程的唯一标识，用于过滤章节
 * 
 * 响应：
 * =====
 * - 如果提供 course：返回该课程下的章节列表
 * - 如果未提供 course：返回所有章节列表
 */
import { defineEventHandler, getQuery } from 'h3'
import { getContentEngine } from '@ce'

export default defineEventHandler(async event => {
  /** 获取 URL 查询参数 */
  const query = getQuery(event)
  
  /** 
   * 提取 course 参数，确保是字符串类型
   * 如果不是字符串或未提供，则为 undefined
   */
  const courseSlug = query.course && typeof query.course === 'string'
    ? query.course
    : undefined
  
  /** 获取 Content Engine 实例（延迟初始化） */
  const engine = getContentEngine()
  
  /** 获取章节列表（支持按课程过滤） */
  return engine.listChapters({ courseSlug })
})
