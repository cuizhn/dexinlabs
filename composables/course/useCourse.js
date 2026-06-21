// composables/useChapter.js

import { chapterRepository }
  from '~/repositories/chapterRepository'

export async function useChapter(
  courseSlug,
  chapterSlug
) {

  const chapter =
    await chapterRepository.findBySlug(
      courseSlug,
      chapterSlug
    )

  const navigation =
    await chapterRepository.getNavigation(
      courseSlug,
      chapterSlug
    )

  return {
    chapter,
    navigation
  }
}