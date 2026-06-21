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

  if (!chapter) {
    return {
      chapter: null,
      navigation: {
        prev: null,
        next: null
      }
    }
  }

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