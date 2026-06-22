

export const chapterRepository = {

  async findBySlug(courseSlug, chapterSlug) {
    return await queryCollection('chapters')
      .where('course', '=', courseSlug)
      .where('slug', '=', chapterSlug)
      .first()
  },

  async findAllByCourse(courseSlug) {
    return await queryCollection('chapters')
      .where('course', '=', courseSlug)
      .order('order', 'ASC')
      .all()
  }
}