/**
 * 章节详情 API 端点 - 获取单个章节内容
 */
import { defineEventHandler, createError } from 'h3'
import { chapterRepository } from '~/repositories/chapterRepository'

export default defineEventHandler(async (event) => {
  const { courseSlug, chapterSlug } = event.context.params
  const chapter = await chapterRepository.findBySlug(event, courseSlug, chapterSlug)
  
  if (!chapter) {
    throw createError({ statusCode: 404, statusMessage: '章节未找到' })
  }

  return chapter
})
