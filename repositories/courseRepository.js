export const courseRepository = {
async findAll() {

    const docs =
      await queryCollection('courses')
        .all()

    return docs
      .filter(doc =>
        doc.path.endsWith('_course')
      )
      .sort(
        (a,b) =>
          (a.order ?? 0) -
          (b.order ?? 0)
      )
  }
  async findBySlug(slug) {
    const course =
      await queryCollection('courses')
        .path(`/courses/${slug}/_course`)
        .first()

    return course || null
  },

  async getChapters(courseSlug) {

    const docs =
      await queryCollection('courses')
        .all()

    return docs
      .filter(doc =>
        doc.path.startsWith(
          `/courses/${courseSlug}/`
        )
        && doc.extension === 'md'
      )
      .map(doc => ({
        slug: doc.slug || doc.path.split('/').pop(),
        title: doc.title,
        order: doc.order ?? 0,
        path: doc.path
      }))
      .sort((a, b) => a.order - b.order)
  }
}