/**
 * 通用 slug 路由处理器工厂
 *
 * 为 [slug].get.ts 类型的 API 端点提供统一的参数校验和 404 处理，
 * 避免在每个实体路由中重复编写相同的错误处理代码。
 */
import { defineEventHandler, getRouterParam, createError } from 'h3'

export function createSlugHandler<T>(
  entityName: string,
  fetcher: (slug: string) => Promise<T | null>
) {
  return defineEventHandler(async event => {
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少 slug 参数'
      })
    }

    const result = await fetcher(slug)

    if (!result) {
      throw createError({
        statusCode: 404,
        statusMessage: `未找到${entityName}：${slug}`
      })
    }

    return result
  })
}
