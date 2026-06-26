export const lessonRepository = {

  async getLesson(slug) {
    return await $fetch(
      `/api/lessons/${slug}`
    )
  }

}
