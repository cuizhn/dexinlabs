import { defineEventHandler, getQuery } from 'h3'
import { topicService } from '@content'
import { assertDatabaseReady } from '@server/utils/error'

export default defineEventHandler(async event => {
  assertDatabaseReady()

  const query = getQuery(event)
  const domainSlug = typeof query.domain === 'string' ? query.domain : undefined

  return topicService.list(domainSlug)
})