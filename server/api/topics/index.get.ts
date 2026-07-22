/**
 * GET /api/topics - 获取知识主题列表，可选按领域 slug 过滤
 */
import { defineEventHandler, getQuery } from 'h3'
import { topicService } from '@content'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const domainSlug = typeof query.domain === 'string' ? query.domain : undefined

  return topicService.list(domainSlug)
})
