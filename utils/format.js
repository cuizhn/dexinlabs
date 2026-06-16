/**
 * 格式化工具函数
 *
 * 功能说明：
 * 本文件提供通用的格式化工具函数，用于将数据转换为用户友好的展示文本。
 * 主要包括难度标签转换和学习时长格式化两个函数。
 */

/**
 * 难度标识到中文标签的映射表
 * 用于将后端/逻辑层的难度标识转换为前端展示的中文文本
 * - beginner: 入门级课程
 * - intermediate: 进阶级课程
 * - advanced: 高级课程
 */
const DIFFICULTY_LABELS = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
}

/**
 * 获取难度标签文本
 * 根据难度标识返回对应的中文标签
 * @param {string} difficulty - 难度标识（'beginner' | 'intermediate' | 'advanced'）
 * @returns {string} 难度中文标签，未知标识时返回 '未知'
 */
export function getDifficultyLabel(difficulty) {
  const labels = {
    beginner: '入门',       // 入门级
    intermediate: '进阶',   // 进阶级
    advanced: '高级',       // 高级
  }
  return labels[difficulty] || '未知'  // 未匹配到任何已知难度时返回 '未知'
}

/**
 * 格式化学习时长
 * 将分钟数转换为更易读的时长文本
 * - 不足 60 分钟：显示 "X 分钟"，如 "45 分钟"
 * - 整小时：显示 "X 小时"，如 "2 小时"
 * - 有余数：显示 "X 小时 Y 分钟"，如 "1 小时 30 分钟"
 *
 * @param {number} minutes - 分钟数（非负整数）
 * @returns {string} 格式化后的时长文本
 */
export function formatDuration(minutes) {
  // 不足一小时，直接显示分钟数
  if (minutes < 60) {
    return `${minutes} 分钟`
  }
  // 计算小时数和剩余分钟数
  const hours = Math.floor(minutes / 60)  // 向下取整得到小时数
  const mins = minutes % 60               // 取余得到剩余分钟数
  // 有剩余分钟时同时显示小时和分钟，否则只显示小时
  return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`
}
