import { chapterRepository } from '~/repositories/chapterRepository'

export function useChapter() {

  async function getChapter(courseSlug, chapterSlug) {
    return await chapterRepository.findBySlug(courseSlug, chapterSlug)
  }

  async function getChapters(courseSlug) {
    return await chapterRepository.findAllByCourse(courseSlug)
  }

  return {
    getChapter,
    getChapters
  }
}