/**
 * 课程 Composable - 封装课程相关的业务逻辑
 * 页面组件通过此 Composable 获取数据，不直接调用 API
 */

export function useCourse() {
  /**
   * 获取所有课程列表
   */
  async function getAllCourses() {
    const { data } = await useFetch('/api/courses')
    return data.value || []
  }

  /**
   * 获取单个课程详情（含章节列表）
   * @param {string} slug - 课程标识
   */
  async function getCourse(slug) {
    const { data } = await useFetch(`/api/courses/${slug}`)
    return data.value || null
  }

  return {
    getAllCourses,
    getCourse
  }
}
