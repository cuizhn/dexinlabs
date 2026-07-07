import { chapterService } from '../services/ChapterService.js'

export async function loadChapter(slug, opts = {}) {
  if (!slug) return { chapter: null, exercise: null, lessons: [], __loadedBy: 'content-loader/chapter' }
  const result = await chapterService.getBySlug(slug)
  if (!result || !result.chapter) {
    return { chapter: null, exercise: null, lessons: [], __loadedBy: 'content-loader/chapter' }
  }
  return {
    ...result,
    __loadedBy: 'content-loader/chapter'
  }
}

export async function listChapters(courseSlug = null) {
  return chapterService.list(courseSlug)
}

export default { loadChapter, listChapters }
