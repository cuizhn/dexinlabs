/**
 * 课程详情 API 端点 - 获取单个课程及其章节列表
 */
import { defineEventHandler, createError } from 'h3'
import { courseRepository } from '~/repositories/courseRepository'

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params
  const course = await courseRepository.findBySlug(event, slug)
  
  if (!course) {
    throw createError({ statusCode: 404, statusMessage: '课程未找到' })
  }

  const chapters = await courseRepository.getChapters(event, slug)
  
  return {
    ...course,
    chapters
  }
})
