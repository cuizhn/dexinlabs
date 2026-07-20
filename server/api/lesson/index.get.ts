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
