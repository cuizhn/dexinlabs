import { defineEventHandler } from 'h3'
import { topicService } from '~/learning/topic/service'
import { assertDatabaseReady } from '@server/utils/error'

export default defineEventHandler(async event => {
  assertDatabaseReady()

  // 架构 V4（定稿）：topics 不再有 courseId，直接返回所有主题
  return topicService.list()
})
