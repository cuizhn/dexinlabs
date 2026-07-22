import { defineEventHandler, getRouterParam, createError } from 'h3'
import { assertDatabaseReady } from './error'

export function createSlugHandler<T>(
  entityName: string,
  fetcher: (slug: string) => Promise<T | null>
) {
  return defineEventHandler(async event => {
    assertDatabaseReady()

    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        message: '缺少 slug 参数'
      })
    }

    const result = await fetcher(slug)

    if (!result) {
      throw createError({
        statusCode: 404,
        message: `未找到${entityName}：${slug}`
      })
    }

    return result
  })
}