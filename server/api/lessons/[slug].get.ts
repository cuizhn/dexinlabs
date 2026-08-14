/**
 * GET /api/lessons/:slug?topic={topicSlug} - 根据组合键获取课时详情
 *
 * 架构 V4（定稿）：Lesson 唯一约束为 (topic_id, slug)，
 * 因此需要同时提供 topic 和 slug 两个参数。
 */
import { defineEventHandler, getQuery, getRouterParam, createError } from 'h3'
import { lessonService } from '~/content/service/lesson'
import { assertDatabaseReady } from '@server/utils/error'

export default defineEventHandler(async event => {
  assertDatabaseReady()

  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: '缺少 slug 参数' })
  }

  const query = getQuery(event)
  const topic = typeof query.topic === 'string' ? query.topic : ''
  if (!topic) {
    throw createError({ statusCode: 400, message: '缺少 topic 参数' })
  }

  const result = await lessonService.getLessonPage(topic, slug)
  if (!result) {
    throw createError({ statusCode: 404, message: `未找到课时：${topic}/${slug}` })
  }

  return result
})
