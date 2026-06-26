
export const chapterRepository = {

  async getChapters() {

    return await $fetch('/api/chapters')
  },
  async getChapter(id) {

    return await $fetch(
      `/api/chapters/${id}`
    )
  }

}