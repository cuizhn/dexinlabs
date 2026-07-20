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
        statusMessage: 'Slug is required'
      })
    }

    const result = await fetcher(slug)

    if (!result) {
      throw createError({
        statusCode: 404,
        statusMessage: `${entityName} not found: ${slug}`
      })
    }

    return result
  })
}
