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

  const lessonSlugs = Array.isArray(chapter.lessons) ? chapter.lessons : []

  const lessons = lessonSlugs.length
    ? await queryCollection(event, 'lesson').where('slug', 'in', lessonSlugs).all()
    : []

  const sortedLessons = lessonSlugs.map(s => lessons.find(l => l.slug === s)).filter(Boolean)

  let exercise = null
  try {
    exercise = await queryCollection(event, 'exercise').where('slug', '=', slug).first()
  } catch {
    exercise = null
  }

  return {
    ...chapter,
    lessons: sortedLessons,
    exercise
  }
})
