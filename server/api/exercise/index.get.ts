/**
 * GET /api/exercise - 练习列表 API 端点
 * 
 * 设计意图：
 * =========
 * 提供练习列表的 RESTful API 接口，支持按章节过滤或获取所有练习。
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
 * - chapter (可选): 章节的唯一标识，用于过滤练习
 * 
 * 响应：
 * =====
 * - 如果提供 chapter：返回该章节下的练习列表
 * - 如果未提供 chapter：返回所有练习列表
 * - 503 Service Unavailable: 数据库未配置
 * - 500 Internal Server Error: 服务器内部错误
 * 
 * 注意：
 * =====
 * 此接口直接使用 exerciseService（依赖数据库），
 * 而不是通过 Content Engine，因此需要检查数据库配置。
 */
import { defineEventHandler, createError, getQuery } from 'h3'
import { exerciseService } from '@ce'

export default defineEventHandler(async event => {
  try {
    /** 
     * 检查数据库配置
     * 如果未配置 DATABASE_URL，返回 503 错误
     */
    if (!process.env.DATABASE_URL) {
      throw createError({
        statusCode: 503,
        statusMessage: 'DATABASE_URL is not configured. Server cannot access the database.'
      })
    }
    
    /** 获取 URL 查询参数 */
    const query = getQuery(event)
    
    /** 
     * 提取 chapter 参数，确保是字符串类型
     * 如果不是字符串或未提供，则为 undefined
     */
    const chapter = typeof query.chapter === 'string' ? query.chapter : undefined
    
    /** 如果提供了 chapter，返回该章节下的练习列表 */
    if (chapter) {
      const rows = await exerciseService.listByChapter(chapter)
      return { ok: true, data: rows }
    }
    
    /** 如果未提供 chapter，返回所有练习列表 */
    const rows = await exerciseService.listAll()
    return { ok: true, data: rows }
    
  } catch (err) {
    /** 如果是 h3 的 Error 对象，直接抛出 */
    if (err && (err as { statusCode?: unknown; statusMessage?: unknown }).statusCode) throw err
    
    /** 否则包装为 500 错误 */
    const msg = err instanceof Error ? err.message : String(err)
    throw createError({ statusCode: 500, statusMessage: `Internal server error: ${msg}` })
  }
})
