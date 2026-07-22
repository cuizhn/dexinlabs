import { defineEventHandler, getQuery, createError } from 'h3'
import { exerciseService } from '@content'
import { assertDatabaseReady } from '@server/utils/error'

export default defineEventHandler(async event => {
  assertDatabaseReady()

  const query = getQuery(event)
  const topic = typeof query.topic === 'string' ? query.topic : undefined

  if (topic) {
    const result = await exerciseService.listByTopicWithMeta(topic)
    if (!result) {
      throw createError({ statusCode: 404, message: `未找到主题：${topic}` })
    }
    return result
  }

  return { exercises: await exerciseService.listAll(), topicTitle: '' }
})