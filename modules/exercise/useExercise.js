/**
 * 练习业务逻辑模块
 *
 * 功能说明：
 * 本文件是练习题相关的业务逻辑模块，负责练习题的数据管理和判题逻辑。
 * 只放逻辑，不放组件。
 *
 * 主要职责：
 * - 提供各课程的练习题数据（选择题、填空题等）
 * - 提供选择题判题方法（比较选项索引）
 * - 提供填空题判题方法（忽略大小写和首尾空格）
 */

/**
 * 练习组合式函数
 * 提供练习题数据和判题方法，供组件调用
 * @returns {Object} 练习相关方法集合
 *   - getExercises: 获取指定课程的练习题列表
 *   - checkChoice: 判断选择题答案是否正确
 *   - checkInput: 判断填空题答案是否正确
 */
export function useExercise() {
  /**
   * 获取指定课程的练习题
   * 根据课程标识返回对应的练习题数组
   * 每道练习题包含以下字段：
   * - id: 题目唯一编号
   * - type: 题目类型（'choice' 选择题 / 'input' 填空题）
   * - question: 题目内容（支持 LaTeX 数学公式）
   * - options: 选择题选项数组（仅 type 为 'choice' 时存在）
   * - correctIndex: 选择题正确选项的索引（仅 type 为 'choice' 时存在）
   * - correctAnswer: 填空题正确答案字符串（仅 type 为 'input' 时存在）
   *
   * @param {string} courseSlug - 课程标识，如 'algebra'、'geometry'
   * @returns {Array} 练习题列表数组，课程不存在时返回空数组
   */
  function getExercises(courseSlug) {
    const exercises = {
      // 代数课程练习题
      algebra: [
        {
          id: 1,                       // 题目编号
          type: 'choice',              // 题目类型：选择题
          question: '若 $x + 3 = 7$，则 $x$ 的值为？',  // 题目（含 LaTeX 公式）
          options: ['3', '4', '5', '10'],  // 选项列表
          correctIndex: 1,             // 正确答案索引：1（即 '4'）
        },
        {
          id: 2,                       // 题目编号
          type: 'input',               // 题目类型：填空题
          question: '解方程 $2x - 6 = 0$，$x$ 的值为？',  // 题目（含 LaTeX 公式）
          correctAnswer: '3',          // 正确答案字符串
        },
      ],
      // 几何课程练习题
      geometry: [
        {
          id: 1,                       // 题目编号
          type: 'choice',              // 题目类型：选择题
          question: '两条平行线被第三条直线所截，同位角的关系是？',  // 题目
          options: ['互补', '相等', '互余', '无关系'],  // 选项列表
          correctIndex: 1,             // 正确答案索引：1（即 '相等'）
        },
      ],
    }

    // 根据课程标识返回对应练习题，未找到则返回空数组
    return exercises[courseSlug] || []
  }

  /**
   * 判断选择题答案是否正确
   * 直接比较用户选择的选项索引与正确选项索引
   * @param {number} selectedIndex - 用户选择的选项索引（从 0 开始）
   * @param {number} correctIndex - 正确选项索引（从 0 开始）
   * @returns {boolean} 答案是否正确
   */
  function checkChoice(selectedIndex, correctIndex) {
    return selectedIndex === correctIndex
  }

  /**
   * 判断填空题答案是否正确
   * 对比前会先去除首尾空格并转为小写，使判题更宽松
   * 例如：用户输入 " 3 " 和正确答案 "3" 会被判定为正确
   * @param {string} userAnswer - 用户输入的答案
   * @param {string} correctAnswer - 正确答案
   * @returns {boolean} 答案是否正确
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
