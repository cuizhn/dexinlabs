/**
 * GET /api/exercise - 获取练习列表
 *
 * ?chapter=xxx 时返回指定章节的练习及章节标题，否则返回全部练习。
 */
import { defineEventHandler, getQuery } from 'h3'
import { exerciseService } from '@content'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const chapter = typeof query.chapter === 'string' ? query.chapter : undefined

  if (chapter) {
    return exerciseService.listByChapterWithMeta(chapter)
  }

  return { exercises: await exerciseService.listAll(), chapterTitle: '' }
})
