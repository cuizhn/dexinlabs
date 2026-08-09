import { defineEventHandler, getQuery, createError } from 'h3'
import { exerciseService } from '~/learning/exercise/service'
import { assertDatabaseReady } from '@server/utils/error'

export default defineEventHandler(async event => {
  assertDatabaseReady()

  const query = getQuery(event)
  const topic = typeof query.topic === 'string' ? query.topic : undefined

  if (topic) {
    const result = await exerciseService.getExercisePage(topic)
    if (!result) {
      throw createError({ statusCode: 404, message: `未找到主题：${topic}` })
    }
    return result
  }

  return { exercise: null, topicTitle: '' }
})