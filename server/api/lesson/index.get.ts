/**
 * GET /api/lesson - 获取课时列表
 *
 * ?chapter=xxx 时按章节过滤，否则返回全部课时。
 */
import { defineEventHandler, getQuery } from 'h3'
import { lessonService } from '@content'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const chapter = typeof query.chapter === 'string' ? query.chapter : undefined

  if (chapter) {
    return lessonService.listByChapter(chapter)
  }

  return lessonService.listAll()
})
