/**
 * GET /api/lessons/:slug?topic={topicSlug}&chapter={chapterSlug} - 根据三元组获取课时详情
 *
 * 架构 V5（三层 identity）：Lesson 唯一约束为 (topic_slug, chapter_slug, lesson_slug)，
 * 必须同时提供 topic、chapter 和 slug 三个参数，缺少 chapter 不 fallback（400）。
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

  const chapter = typeof query.chapter === 'string' ? query.chapter : ''
  if (!chapter) {
    throw createError({ statusCode: 400, message: '缺少 chapter 参数' })
  }

  const result = await lessonService.getLessonPage(topic, chapter, slug)
  if (!result) {
    throw createError({ statusCode: 404, message: `未找到课时：${topic}/${chapter}/${slug}` })
  }

  return result
})
