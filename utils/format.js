/**
 * 格式化工具函数
 */

/**
 * 获取难度标签文本
 * @param {string} difficulty - 难度标识
 * @returns {string} 难度中文标签
 */
export function getDifficultyLabel(difficulty) {
  const labels = {
    beginner: '入门',
    intermediate: '进阶',
    advanced: '高级',
  }
  return labels[difficulty] || '未知'
}

/**
 * 格式化学习时长
 * @param {number} minutes - 分钟数
 * @returns {string} 格式化后的时长文本
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} 分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`
}
