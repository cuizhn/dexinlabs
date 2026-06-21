export const courseRepository = {

  async findAll() {
    return await queryCollection('courses')
      .order('order', 'ASC')
      .all()
  },

  async findBySlug(slug) {
    return await queryCollection('courses')
      .where('id', '=', slug)
      .first()
  },

  async getChapters(courseSlug) {
    return await queryCollection('chapters')
      .where('course', '=', courseSlug)
      .order('order', 'ASC')
      .all()
  }

}