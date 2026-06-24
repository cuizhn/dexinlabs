import { chapterRepository } from '~/repositories/chapterRepository'

export function useChapter() {

  async function getChapters(courseSlug) {

    return await chapterRepository.findAllByCourse(
      courseSlug
    )
  }

  async function getChapter(
    courseSlug,
    chapterSlug
  ) {

    return await chapterRepository.findBySlug(
      courseSlug,
      chapterSlug
    )
  }

  return {
    getChapters,
    getChapter
  }
}