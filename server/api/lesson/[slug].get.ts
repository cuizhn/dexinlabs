import { defineEventHandler, getRouterParam, createError } from 'h3'
import { lessonService } from '@ce'

export default defineEventHandler(async event => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  const result = await lessonService.getLessonPage(slug)

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: `Lesson not found: ${slug}`
    })
  }

  return result
})
