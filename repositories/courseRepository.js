

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

  // ⭐关键升级：课程 + 章节聚合
  async findWithMeta(slug) {

    const course = await this.findBySlug(slug)
    if (!course) return null

    const chapters = await queryCollection('chapters')
      .where('course', '=', slug)
      .order('order', 'ASC')
      .all()

    return {
      ...course,
      chapters,
      chapterCount: chapters.length
    }
  }
}