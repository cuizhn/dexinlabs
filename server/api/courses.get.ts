/**
 * 课程 API 端点 - 获取所有课程列表
 */
import { defineEventHandler } from 'h3'
import { courseRepository } from '~/repositories/courseRepository'

export default defineEventHandler(async (event) => {
  return await courseRepository.findAll(event)
})
