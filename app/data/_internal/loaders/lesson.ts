import { lessonService } from '@data/services'
import type { Lesson, LoaderOptions } from '@core/contracts/Loader'
import { chapters } from '~~/drizzle/db'
type SelectChapter = typeof chapters.$inferSelect

export type LoadedLesson = Omit<Lesson, 'chapter'> & {
  chapter?: SelectChapter | null
  __loadedBy: string
}

export async function loadLesson(
  slug: string,
  opts: LoaderOptions = {}
): Promise<LoadedLesson | null> {
  if (!slug) return null
  const result = await lessonService.getBySlug(slug)
  if (!result) return null
  return {
    ...(result as unknown as LoadedLesson),
    __loadedBy: 'content-loader/lesson'
  }
}

export async function loadLessonById(
  id: number | null | undefined
): Promise<Lesson | null> {
  if (id == null) return null
  const lessonsRepo = (lessonService as unknown as { lessons?: { getById?: (id: number) => Promise<Lesson | null> } }).lessons
  return lessonsRepo?.getById?.(id) || null
}

export async function listLessons(
  chapterSlug: string
): Promise<Lesson[]> {
  return lessonService.listByChapter(chapterSlug) as Promise<Lesson[]>
}

export default { loadLesson, loadLessonById, listLessons }
