import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async event => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  const chapter = await queryCollection(event, 'chapter').where('slug', '=', slug).first()

  if (!chapter) {
    throw createError({
      statusCode: 404,
      statusMessage: `Chapter not found: ${slug}`
    })
  }


  let exercise = null
  try {
    exercise = await queryCollection(event, 'exercise').where('slug', '=', slug).first()
  } catch {
    exercise = null
  }

  return {
    chapter,
    exercise
  }
})
