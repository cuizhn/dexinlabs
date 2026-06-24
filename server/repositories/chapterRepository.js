import { queryCollection } from '@nuxt/content'

export const chapterRepository = {

  async findAllByCourse(courseSlug) {
    return await queryCollection('chapters')
      .where('course', '=', courseSlug)
      .order('order', 'ASC')
      .all()
  },

  async findBySlug(courseSlug, chapterSlug) {
    const chapters =
      await this.findAllByCourse(courseSlug)

    return chapters.find(
      chapter => chapter.slug === chapterSlug
    ) || null
  }
}