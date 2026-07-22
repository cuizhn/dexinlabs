import { defineEventHandler, getQuery, createError } from 'h3'
import { domainService } from '@content'
import { assertDatabaseReady } from '@server/utils/error'

export default defineEventHandler(async event => {
  assertDatabaseReady()

  const query = getQuery(event)
  const slug = typeof query.slug === 'string' ? query.slug : ''

  if (slug) {
    const result = await domainService.getDomainPage(slug)
    if (!result) {
      throw createError({ statusCode: 404, message: `未找到领域：${slug}` })
    }
    return result
  }

  return domainService.listAllWithTopics()
})