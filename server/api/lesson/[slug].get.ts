import { defineEventHandler, getRouterParam, createError } from 'h3'


export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required',
    })
  }

  const lesson = await queryCollection(event, 'lesson')
    .where('slug', '=', slug)
    .first()

  if (!lesson) {
    throw createError({
      statusCode: 404,
      statusMessage: `Lesson not found: ${slug}`,
    })
  }

  return lesson
})
