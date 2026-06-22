/**
 * 章节 Composable - 封装章节相关的业务逻辑
 * 页面组件通过此 Composable 获取数据，不直接调用 API
 */

export function useChapter() {
  /**
   * 获取课程的所有章节
   * @param {string} courseSlug - 课程标识
   */
  async function getChapters(courseSlug) {
    const { data } = await useFetch(`/api/courses/${courseSlug}`)
    return data.value?.chapters || []
  }

  /**
   * 获取单个章节详情
   * @param {string} courseSlug - 课程标识
   * @param {string} chapterSlug - 章节标识
   */
  async function getChapter(courseSlug, chapterSlug) {
    const { data } = await useFetch(`/api/courses/${courseSlug}/${chapterSlug}`)
    return data.value || null
  }

  return {
    getChapters,
    getChapter
  }
}
