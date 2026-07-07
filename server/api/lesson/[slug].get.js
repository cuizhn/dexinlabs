import { defineEventHandler, getRouterParam, createError } from 'h3'
import { lessonService } from '@modules/content/services/index.js'

export default defineEventHandler(async event => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  const result = await lessonService.getBySlug(slug)

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: `Lesson not found: ${slug}`
    })
  }

  return result
})
