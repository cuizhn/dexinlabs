import { defineEventHandler, getRouterParam, createError } from 'h3'
import { chapterService } from '@ce'

export default defineEventHandler(async event => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  const result = await chapterService.getChapterPage(slug)

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: `Chapter not found: ${slug}`
    })
  }

  return result
})
