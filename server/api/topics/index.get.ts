import { defineEventHandler, getQuery } from 'h3'
import { topicService } from '@content'
import { assertDatabaseReady } from '@server/utils/error'

export default defineEventHandler(async event => {
  assertDatabaseReady()

  const query = getQuery(event)
  const courseId = query.course ? Number(query.course) : undefined

  return topicService.list(courseId)
})
