/**
 * GET /api/lesson - 课时列表 API 端点
 * 
 * 设计意图：
 * =========
 * 提供课时列表的 RESTful API 接口，支持按章节过滤或获取所有课时。
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
 * - chapter (可选): 章节的唯一标识，用于过滤课时
 * 
 * 响应：
 * =====
 * - 如果提供 chapter：返回该章节下的课时列表
 * - 如果未提供 chapter：返回所有课程下的所有课时（扁平化）
 * - 500 Internal Server Error: 服务器内部错误
 */
import { defineEventHandler, createError, getQuery } from 'h3'
import { getContentEngine } from '@ce'

export default defineEventHandler(async event => {
  try {
    /** 获取 URL 查询参数 */
    const query = getQuery(event)
    
    /** 
     * 提取 chapter 参数，确保是字符串类型
     * 如果不是字符串或未提供，则为 undefined
     */
    const chapter = typeof query.chapter === 'string' ? query.chapter : undefined
    
    /** 获取 Content Engine 实例（延迟初始化） */
    const engine = getContentEngine()
    
    /** 如果提供了 chapter，返回该章节下的课时列表 */
    if (chapter) {
      const rows = await engine.listLessons(chapter)
      return { ok: true, data: rows }
    }
    
    /** 
     * 如果未提供 chapter，返回所有课程下的所有课时
     * 实现逻辑：
     * 1. 获取所有课程
     * 2. 遍历每个课程的章节
     * 3. 遍历每个章节的课时
     * 4. 将所有课时扁平化到一个数组中，并添加章节信息
     */
    const courses = await engine.listCourses()
    const allLessons: Array<Record<string, unknown>> = []
    
    for (const course of courses) {
      for (const chapter of course.chapters || []) {
        /** 将课时添加到数组中，并附带章节 slug */
        allLessons.push(
          ...chapter.lessons?.map(l => ({ ...l, chapter: chapter.slug }) as Record<string, unknown>) || []
        )
      }
    }
    
    return { ok: true, data: allLessons }
    
  } catch (err) {
    /** 如果是 h3 的 Error 对象，直接抛出 */
    if (err && (err as { statusCode?: unknown; statusMessage?: unknown }).statusCode) throw err
    
    /** 否则包装为 500 错误 */
    const msg = err instanceof Error ? err.message : String(err)
    throw createError({ statusCode: 500, statusMessage: `Internal server error: ${msg}` })
  }
})
