import { courseRepository } from './courseRepository'

export const chapterRepository = {

  async findBySlug(courseSlug, chapterSlug) {

    const docs =
      await queryCollection('courses')
        .all()

    return docs.find(doc =>
      doc.path ===
        `/courses/${courseSlug}/${chapterSlug}`
      || doc.slug === chapterSlug
    ) || null
  },

  async getNavigation(courseSlug, chapterSlug) {

    const chapters =
      await courseRepository.getChapters(courseSlug)

    const index =
      chapters.findIndex(
        c => c.slug === chapterSlug
      )

    if (index === -1) {
      return {
        prev: null,
        next: null
      }
    }

    return {
      prev: chapters[index - 1] ?? null,
      next: chapters[index + 1] ?? null
    }
  }
}