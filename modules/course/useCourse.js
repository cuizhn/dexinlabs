/**
 * 课程业务逻辑模块
 * 负责课程数据的获取、查询和导航逻辑
 * 只放逻辑，不放组件
 */

const coursesData = {
  algebra: {
    id: 'algebra',
    title: '代数入门',
    description: '用字母表示数，掌握方程与不等式的解法',
    icon: 'x',
    difficulty: 'beginner',
    order: 1,
    chapters: [
      { slug: '01-introduction', title: '代数基础与方程', order: 1 },
      { slug: '02-functions', title: '函数与图像', order: 2 },
    ],
  },
  geometry: {
    id: 'geometry',
    title: '平面几何',
    description: '探索点、线、面的关系，掌握几何证明方法',
    icon: '∆',
    difficulty: 'intermediate',
    order: 2,
    chapters: [
      { slug: '01-lines-and-angles', title: '线与角', order: 1 },
    ],
  },
  trigonometry: {
    id: 'trigonometry',
    title: '三角函数',
    description: '深入学习正弦、余弦、正切等三角函数及其应用',
    icon: 'sin',
    difficulty: 'intermediate',
    order: 3,
    chapters: [
      { slug: '01-introduction', title: '三角函数入门', order: 1 },
    ],
  },
  probability: {
    id: 'probability',
    title: '概率论',
    description: '探索随机事件和概率分布，培养概率思维',
    icon: 'P',
    difficulty: 'advanced',
    order: 4,
    chapters: [
      { slug: '01-basics', title: '概率论基础', order: 1 },
    ],
  },
  statistics: {
    id: 'statistics',
    title: '统计学入门',
    description: '学习数据收集、分析和解读的基本方法',
    icon: 'σ',
    difficulty: 'intermediate',
    order: 5,
    chapters: [
      { slug: '01-basics', title: '统计学基础', order: 1 },
    ],
  },
}

/**
 * 课程组合式函数
 * 提供课程数据的查询方法
 * @returns {Object} 课程查询方法
 */
export function useCourse() {
  /**
   * 获取单个课程
   * @param {string} courseSlug - 课程标识
   * @returns {Object|null} 课程数据
   */
  function getCourse(courseSlug) {
    return coursesData[courseSlug] || null
  }

  /**
   * 获取所有课程列表
   * @returns {Array} 课程列表
   */
  function getAllCourses() {
    return Object.values(coursesData).sort((a, b) => a.order - b.order)
  }

  /**
   * 获取指定课程的章节
   * @param {string} courseSlug - 课程标识
   * @param {string} chapterSlug - 章节标识
   * @returns {Object|null} 章节数据
   */
  function getChapter(courseSlug, chapterSlug) {
    const course = coursesData[courseSlug]
    if (!course) return null
    return course.chapters.find((ch) => ch.slug === chapterSlug) || null
  }

  /**
   * 获取章节导航（上一章/下一章）
   * @param {string} courseSlug - 课程标识
   * @param {string} chapterSlug - 当前章节标识
   * @returns {Object} 导航信息 { prev, next }
   */
  function getChapterNavigation(courseSlug, chapterSlug) {
    const course = coursesData[courseSlug]
    if (!course) return { prev: null, next: null }

    const index = course.chapters.findIndex((ch) => ch.slug === chapterSlug)
    return {
      prev: index > 0 ? course.chapters[index - 1] : null,
      next: index < course.chapters.length - 1 ? course.chapters[index + 1] : null,
    }
  }

  return {
    getCourse,
    getAllCourses,
    getChapter,
    getChapterNavigation,
  }
}
