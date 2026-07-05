import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async event => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  const lesson = await queryCollection(event, 'lesson')
    .where('slug', '=', slug)
    .first()

  if (!lesson) {
    throw createError({
      statusCode: 404,
      statusMessage: `Lesson not found: ${slug}`
    })
  }

  let chapter = null
  if (lesson.chapter) {
    try {
      chapter = await queryCollection(event, 'chapter')
        .where('slug', '=', lesson.chapter)
        .first()
    } catch {
      chapter = null
    }
  }

  return {
    ...lesson,
    chapter
  }
})
