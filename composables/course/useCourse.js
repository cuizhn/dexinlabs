/**
 * 课程组合式函数（Composable）
 *
 * 功能说明：
 * 本文件是课程相关的组合式函数，提供课程数据的查询和导航功能。
 * 注意：此文件中 coursesData 仅包含 algebra（代数入门）一个课程的定义，
 * 其他课程数据定义在 modules/course/useCourse.js 中。
 *
 * 主要职责：
 * - 定义课程元数据（ID、标题、描述、难度、章节列表等）
 * - 提供按课程标识查询课程的方法
 * - 提供获取全部课程列表的方法
 * - 提供按课程和章节标识查询章节的方法
 * - 提供章节上下导航（上一章/下一章）的方法
 */

/**
 * 课程数据对象
 * 键为课程标识（slug），值为课程的完整元数据
 * 每个课程包含以下字段：
 * - id: 课程唯一标识，与键名保持一致
 * - title: 课程中文标题
 * - description: 课程简介描述
 * - icon: 课程图标标识（用于前端展示图标）
 * - difficulty: 课程难度等级（beginner/intermediate/advanced）
 * - order: 课程排序权重，数值越小越靠前
 * - chapters: 章节列表数组，每个章节包含 slug（URL 路径标识）、title（标题）、order（排序）
 */
const coursesData = {
  algebra: {
    id: 'algebra',              // 课程唯一标识
    title: '代数入门',           // 课程显示标题
    description: '用字母表示数，掌握方程与不等式的解法',  // 课程简介
    icon: 'x',                  // 图标标识，对应数学符号 x
    difficulty: 'beginner',     // 难度等级：入门
    order: 1,                   // 排序权重，排在第 1 位
    chapters: [
      { slug: '01-introduction', title: '代数基础与方程', order: 1 },  // 第 1 章：代数基础与方程
      { slug: '02-functions', title: '函数与图像', order: 2 },         // 第 2 章：函数与图像
    ],
  },

}

/**
 * 课程组合式函数
 * 提供课程数据的查询方法，供组件和其他模块调用
 * @returns {Object} 课程查询方法集合
 *   - getCourse: 获取单个课程数据
 *   - getAllCourses: 获取所有课程列表（按 order 排序）
 *   - getChapter: 获取指定课程的指定章节
 *   - getChapterNavigation: 获取章节的上下导航信息
 */
export function useCourse() {
  /**
   * 获取单个课程数据
   * 根据课程标识（slug）查找对应的课程元数据
   * @param {string} courseSlug - 课程标识，如 'algebra'
   * @returns {Object|null} 课程数据对象，未找到时返回 null
   */
  function getCourse(courseSlug) {
    return coursesData[courseSlug] || null
  }

  /**
   * 获取所有课程列表
   * 将 coursesData 对象转为数组，并按 order 字段升序排列
   * @returns {Array} 排序后的课程列表数组
   */
  function getAllCourses() {
    return Object.values(coursesData).sort((a, b) => a.order - b.order)
  }

  /**
   * 获取指定课程的章节
   * 先找到课程，再在课程的 chapters 数组中查找匹配的章节
   * @param {string} courseSlug - 课程标识，如 'algebra'
   * @param {string} chapterSlug - 章节标识，如 '01-introduction'
   * @returns {Object|null} 章节数据对象，课程或章节未找到时返回 null
   */
  function getChapter(courseSlug, chapterSlug) {
    const course = coursesData[courseSlug]
    if (!course) return null  // 课程不存在，直接返回 null
    return course.chapters.find((ch) => ch.slug === chapterSlug) || null
  }

  /**
   * 获取章节导航（上一章/下一章）
   * 根据当前章节在 chapters 数组中的位置，计算前后章节
   * @param {string} courseSlug - 课程标识
   * @param {string} chapterSlug - 当前章节标识
   * @returns {Object} 导航信息对象
   *   - prev: 上一章节数据，第一章时为 null
   *   - next: 下一章节数据，最后一章时为 null
   */
  function getChapterNavigation(courseSlug, chapterSlug) {
    const course = coursesData[courseSlug]
    if (!course) return { prev: null, next: null }  // 课程不存在，返回空导航

    // 查找当前章节在数组中的索引位置
    const index = course.chapters.findIndex((ch) => ch.slug === chapterSlug)
    return {
      prev: index > 0 ? course.chapters[index - 1] : null,           // 非第一章时返回上一章
      next: index < course.chapters.length - 1 ? course.chapters[index + 1] : null,  // 非最后一章时返回下一章
    }
  }

  return {
    getCourse,
    getAllCourses,
    getChapter,
    getChapterNavigation,
  }
}
