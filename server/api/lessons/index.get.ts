/**
 * GET /api/lessons - 获取课时列表
 *
 * ?topic=xxx 时按知识主题过滤，否则返回全部课时。
 */
import { defineEventHandler, getQuery } from 'h3'
import { lessonService } from '@content'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const topic = typeof query.topic === 'string' ? query.topic : undefined

  if (topic) {
    return lessonService.listByTopic(topic)
  }

  return lessonService.listAll()
})
