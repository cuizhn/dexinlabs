/**
 * 练习业务逻辑模块
 * 负责练习题的数据和判题逻辑
 * 只放逻辑，不放组件
 */

/**
 * 练习组合式函数
 * 提供练习题数据和判题方法
 * @returns {Object} 练习相关方法
 */
export function useExercise() {
  /**
   * 获取指定课程的练习题
   * @param {string} courseSlug - 课程标识
   * @returns {Array} 练习题列表
   */
  function getExercises(courseSlug) {
    const exercises = {
      algebra: [
        {
          id: 1,
          type: 'choice',
          question: '若 $x + 3 = 7$，则 $x$ 的值为？',
          options: ['3', '4', '5', '10'],
          correctIndex: 1,
        },
        {
          id: 2,
          type: 'input',
          question: '解方程 $2x - 6 = 0$，$x$ 的值为？',
          correctAnswer: '3',
        },
      ],
      geometry: [
        {
          id: 1,
          type: 'choice',
          question: '两条平行线被第三条直线所截，同位角的关系是？',
          options: ['互补', '相等', '互余', '无关系'],
          correctIndex: 1,
        },
      ],
    }

    return exercises[courseSlug] || []
  }

  /**
   * 判断选择题答案是否正确
   * @param {number} selectedIndex - 用户选择的选项索引
   * @param {number} correctIndex - 正确选项索引
   * @returns {boolean} 是否正确
   */
  function checkChoice(selectedIndex, correctIndex) {
    return selectedIndex === correctIndex
  }

  /**
   * 判断填空题答案是否正确
   * @param {string} userAnswer - 用户输入的答案
   * @param {string} correctAnswer - 正确答案
   * @returns {boolean} 是否正确
   */
  function checkInput(userAnswer, correctAnswer) {
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
  }

  return {
    getExercises,
    checkChoice,
    checkInput,
  }
}
