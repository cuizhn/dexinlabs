import { chapterService } from '@data/services'
import type { Chapter, Lesson, Exercise, LoaderOptions } from '@core/contracts/Loader'

export interface LoadedChapterResult {
  chapter: Chapter | null
  exercise: Exercise | null
  lessons: Lesson[]
  __loadedBy: string
}

export async function loadChapter(
  slug: string,
  opts: LoaderOptions = {}
): Promise<LoadedChapterResult> {
  if (!slug) return { chapter: null, exercise: null, lessons: [], __loadedBy: 'content-loader/chapter' }
  const result = await chapterService.getBySlug(slug)
  if (!result || !result.chapter) {
    return { chapter: null, exercise: null, lessons: [], __loadedBy: 'content-loader/chapter' }
  }
  return {
    chapter: result.chapter as unknown as Chapter,
    exercise: result.exercise as unknown as Exercise | null,
    lessons: result.lessons as unknown as Lesson[],
    __loadedBy: 'content-loader/chapter'
  }
}

export async function listChapters(
  courseSlug: string | null = null
): Promise<Chapter[]> {
  return chapterService.list(courseSlug ?? undefined) as Promise<Chapter[]>
}

export default { loadChapter, listChapters }
