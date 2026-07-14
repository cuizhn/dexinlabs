import { defineEventHandler, getRouterParam, createError } from 'h3'
import { getContentEngine } from '@ce'

export default defineEventHandler(async event => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  const engine = getContentEngine()
  const exercise = await engine.getExercise(slug)

  if (!exercise) {
    throw createError({
      statusCode: 404,
      statusMessage: `Exercise not found: ${slug}`
    })
  }

  return exercise
})