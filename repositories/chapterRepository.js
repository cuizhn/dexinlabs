import { courseRepository } from './courseRepository'

export const chapterRepository = {

  async findBySlug(courseSlug, chapterSlug) {

    return await queryCollection('chapters')
      .where('course', '=', courseSlug)
      .where('slug', '=', chapterSlug)
      .first()
  },

  async getNavigation(courseSlug, chapterSlug) {

    const chapters =
      await courseRepository.getChapters(courseSlug)

    const index =
      chapters.findIndex(
        c => c.slug === chapterSlug
      )

    return {
      prev: chapters[index - 1] ?? null,
      next: chapters[index + 1] ?? null,
    }
  }
}