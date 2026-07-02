import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async event => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  const exercise = await queryCollection(event, 'exercise')
    .where('slug', '=', slug)

    .first()

  if (!exercise) {
    throw createError({
      statusCode: 404,
      statusMessage: `Exercise not found: ${slug}`
    })
  }

  return exercise
})
