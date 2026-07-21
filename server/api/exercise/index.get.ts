import { defineEventHandler, getQuery } from 'h3'
import { exerciseService, chapterRepository } from '@content'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const chapter = typeof query.chapter === 'string' ? query.chapter : undefined

  if (chapter) {
    const [exercises, chapterData] = await Promise.all([
      exerciseService.listByChapter(chapter),
      chapterRepository.getBySlug(chapter)
    ])
    return { exercises, chapterTitle: chapterData?.title || '' }
  }

  return { exercises: await exerciseService.listAll(), chapterTitle: '' }
})
