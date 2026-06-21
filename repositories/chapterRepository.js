// repositories/chapterRepository.js

export const chapterRepository = {

  async findBySlug(
    courseSlug,
    chapterSlug
  ) {

    return await queryCollection('courses')
      .path(
        `/courses/${courseSlug}/${chapterSlug}`
      )
      .first()
  },

  async findAllByCourse(
    courseSlug
  ) {

    const docs =
      await queryCollection('courses')
        .all()

    return docs
      .filter(doc =>
        doc.path.startsWith(
          `/courses/${courseSlug}/`
        )
      )
      .sort(
        (a,b) =>
          a.order - b.order
      )
  },

  async getNavigation(
    courseSlug,
    chapterSlug
  ) {

    const chapters =
      await this.findAllByCourse(
        courseSlug
      )

    const index =
      chapters.findIndex(
        chapter =>
          chapter.slug === chapterSlug
      )

    return {
      prev:
        index > 0
          ? chapters[index - 1]
          : null,

      next:
        index < chapters.length - 1
          ? chapters[index + 1]
          : null
    }
  }
      }
