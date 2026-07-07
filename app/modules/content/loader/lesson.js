import { lessonService } from '../services/LessonService.js'

export async function loadLesson(slug) {
  if (!slug) return null
  const result = await lessonService.getBySlug(slug)
  if (!result) return null
  return {
    ...result,
    __loadedBy: 'content-loader/lesson'
  }
}

export async function loadLessonById(id) {
  if (id == null) return null
  return lessonService.lessons?.getById?.(id) || null
}

export async function listLessons(chapterSlug) {
  return lessonService.listByChapter(chapterSlug)
}

export default { loadLesson, loadLessonById, listLessons }
