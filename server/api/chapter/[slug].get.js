import { defineEventHandler, getRouterParam, createError } from 'h3'
import { chapterService } from '@modules/content/services/index.js'

export default defineEventHandler(async event => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  const result = await chapterService.getBySlug(slug)

  if (!result || !result.chapter) {
    throw createError({
      statusCode: 404,
      statusMessage: `Chapter not found: ${slug}`
    })
  }

  return result
})
