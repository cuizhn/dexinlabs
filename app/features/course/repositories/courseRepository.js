/**
 * 课程 Repository
 * 职责：仅负责查询 Content 数据源
 */


export const courseRepository = {

  async findAll() {
    return await queryCollection('courses')
      .order('order', 'ASC')
      .all()
  },

  async findBySlug(slug) {
    return await queryCollection('courses')
      .where('slug', '=', slug)
      .first()
  }
}
