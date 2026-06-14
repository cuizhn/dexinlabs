import { defineEventHandler, createError } from 'h3'
import { queryCollection } from '@nuxt/content/server'

function getParam(
  value: string | string[] | undefined,
  name: string,
): string {
  if (!value || Array.isArray(value)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Missing ${name} parameter`,
    })
  }

  return value
}

const SLUG_PATTERN = /^[a-z0-9-]+$/i

export default defineEventHandler(async (event) => {
  const slug = getParam(event.context.params?.slug, 'slug')
  const chapter = getParam(event.context.params?.chapter, 'chapter')

  if (
    !SLUG_PATTERN.test(slug) ||
    !SLUG_PATTERN.test(chapter)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid parameter',
    })
  }

  const doc = await queryCollection(event, 'chapters')
    .path(`/courses/${slug}/${chapter}`)
    .first()

  if (!doc) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chapter not found',
    })
  }

  return {
    path: doc.path,
    title: doc.title ?? '',
    description: doc.description ?? '',
    content: doc.body,
    meta: doc.meta ?? {},
  }
})