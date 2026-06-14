/**
 * 章节内容 API
 * GET /api/content/:slug/:chapter
 * 返回章节 Markdown 原始内容
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const chapter = getRouterParam(event, 'chapter')

  if (!slug || !chapter) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing slug or chapter parameter',
    })
  }

  try {
    // 使用 Nuxt Content 查询章节文档
    const doc = await queryCollection('chapters')
      .path(`/courses/${slug}/${chapter}`)
      .first()

    if (!doc) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Chapter not found',
      })
    }

    return {
      content: doc.body || '',
      title: doc.title || '',
      meta: doc.meta || {},
    }
  } catch (error) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch chapter content',
    })
  }
})
