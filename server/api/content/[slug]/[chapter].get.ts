import type { H3Event } from 'h3'
import { defineEventHandler, createError } from 'h3'
import { queryCollection } from '@nuxt/content/server'

/**
 * 章节内容 API
 * GET /api/content/:slug/:chapter
 * 返回章节 Markdown 原始内容
 */
export default defineEventHandler(async (event: H3Event) => {
  const slug = event.context.params?.slug
  const chapter = event.context.params?.chapter

  if (!slug || !chapter || Array.isArray(slug) || Array.isArray(chapter)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing slug or chapter parameter',
    })
  }

  try {
    // 使用 Nuxt Content 查询章节文档
    const doc = await (queryCollection(event, 'chapters' as any) as any)
      .path(`/courses/${slug}/${chapter}`)
      .first()

    if (!doc || typeof doc !== 'object') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Chapter not found',
      })
    }

    return {
      content: doc.body ?? '',
      title: doc.title ?? '',
      meta: doc.meta ?? {},
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch chapter content',
    })
  }
})
