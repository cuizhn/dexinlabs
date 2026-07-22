/**
 * GET /api/exercises - 获取练习列表
 *
 * ?topic=xxx 时返回指定主题的练习及主题标题，否则返回全部练习。
 */
import { defineEventHandler, getQuery } from 'h3'
import { exerciseService } from '@content'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const topic = typeof query.topic === 'string' ? query.topic : undefined

  if (topic) {
    return exerciseService.listByTopicWithMeta(topic)
  }

  return { exercises: await exerciseService.listAll(), topicTitle: '' }
})
