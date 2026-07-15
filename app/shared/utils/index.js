/**
 * 共享工具函数
 * 
 * 设计意图：
 * =========
 * 提供跨模块共享的通用工具函数，避免重复实现。
 * 
 * 职责边界：
 * =========
 * 1. 字符串处理（slugify, makeExcerpt）
 * 2. 对象操作（pick, omit）
 * 3. 数组操作（groupBy, sortBy）
 * 4. 数学计算（clamp）
 * 5. 文本分析（estimateReadingMinutes）
 * 
 * 为什么需要共享工具？
 * ==================
 * 1. **代码复用**：相同的工具函数只实现一次
 * 2. **一致性**：所有模块使用相同的实现
 * 3. **可测试性**：工具函数可以独立测试
 * 
 * 替代方案对比：
 * =============
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | **共享工具文件** | 代码复用，一致性好 | 需要维护共享文件 |
 * | 各模块独立实现 | 独立性强 | 代码重复，可能不一致 |
 * | 第三方库 | 功能丰富 | 增加依赖，可能冗余 |
 * 
 * 本方案优势：
 * ===========
 * - **轻量级**：只实现项目需要的功能，不引入额外依赖
 * - **集中管理**：所有工具函数在一个文件中定义
 * - **类型安全**：使用 JSDoc 注释提供类型提示
 * - **可扩展**：可以随时添加新的工具函数
 * 
 * 使用方式：
 * ========
 * import { slugify, pick, omit } from '@/shared/utils'
 */

/**
 * slugify - 将文本转换为 URL 友好的 slug
 * 
 * 实现逻辑：
 * ========
 * 1. 去除首尾空格
 * 2. 转换为小写
 * 3. 将空格替换为连字符
 * 4. 移除非字母数字、非中文、非连字符的字符
 * 5. 将多个连续连字符替换为单个连字符
 * 6. 移除首尾连字符
 * 
 * 为什么这样设计？
 * ==============
 * 1. **URL 友好**：生成的 slug 可以直接用于 URL
 * 2. **兼容性**：支持中文和英文
 * 3. **唯一性**：相同文本生成相同的 slug
 * 
 * 替代方案：
 * =========
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | **手动实现** | 轻量级，可控 | 需要维护 |
 * | slugify 库 | 功能全面 | 增加依赖 |
 * | URL 编码 | 简单 | 可读性差 |
 * 
 * @param text 输入文本
 * @returns URL 友好的 slug
 */
export function slugify(text = '') {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * pick - 从对象中挑选指定属性
 * 
 * 实现逻辑：
 * ========
 * 1. 创建新对象
 * 2. 遍历 keys 数组
 * 3. 如果属性存在于源对象中，复制到新对象
 * 
 * 为什么这样设计？
 * ==============
 * 1. **数据筛选**：只保留需要的属性
 * 2. **数据安全**：避免传递敏感信息
 * 3. **性能优化**：减少数据传输量
 * 
 * @param obj 源对象
 * @param keys 需要挑选的属性名数组
 * @returns 包含指定属性的新对象
 */
export function pick(obj = {}, keys = []) {
  const out = {}
  for (const k of keys) if (k in obj) out[k] = obj[k]
  return out
}

/**
 * omit - 从对象中排除指定属性
 * 
 * 实现逻辑：
 * ========
 * 1. 浅拷贝源对象
 * 2. 遍历 keys 数组
 * 3. 删除指定的属性
 * 
 * 为什么这样设计？
 * ==============
 * 1. **数据过滤**：移除不需要的属性
 * 2. **数据安全**：移除敏感信息
 * 3. **性能优化**：减少数据传输量
 * 
 * @param obj 源对象
 * @param keys 需要排除的属性名数组
 * @returns 排除指定属性后的新对象
 */
export function omit(obj = {}, keys = []) {
  const out = { ...obj }
  for (const k of keys) delete out[k]
  return out
}

/**
 * groupBy - 按指定键对数组进行分组
 * 
 * 实现逻辑：
 * ========
 * 1. 创建 Map 对象
 * 2. 遍历数组
 * 3. 根据 keyFn 获取分组键
 * 4. 将元素添加到对应的分组中
 * 
 * 为什么使用 Map？
 * ==============
 * 1. **灵活性**：支持任何类型的键
 * 2. **性能**：查找和插入操作都是 O(1)
 * 3. **类型安全**：TypeScript 可以正确推断类型
 * 
 * @param list 源数组
 * @param keyFn 分组键函数或属性名
 * @returns 分组后的 Map 对象
 */
export function groupBy(list = [], keyFn) {
  const map = new Map()
  for (const item of list) {
    const k = typeof keyFn === 'function' ? keyFn(item) : item?.[keyFn]
    if (!map.has(k)) map.set(k, [])
    map.get(k).push(item)
  }
  return map
}

/**
 * sortBy - 按指定键对数组进行排序
 * 
 * 实现逻辑：
 * ========
 * 1. 创建数组副本（避免修改原数组）
 * 2. 使用 sort 方法排序
 * 3. 如果 key 是函数，调用函数获取排序值；否则直接使用属性值
 * 4. 根据 dir 参数决定升序或降序
 * 
 * 为什么创建副本？
 * ==============
 * 1. **不可变性**：避免修改原数组
 * 2. **可预测性**：函数调用不会产生副作用
 * 
 * @param list 源数组
 * @param key 排序键函数或属性名
 * @param dir 排序方向（asc 升序，desc 降序，默认 asc）
 * @returns 排序后的新数组
 */
export function sortBy(list = [], key, dir = 'asc') {
  const sorted = [...list].sort((a, b) => {
    const av = typeof key === 'function' ? key(a) : a?.[key]
    const bv = typeof key === 'function' ? key(b) : b?.[key]
    if (av < bv) return -1
    if (av > bv) return 1
    return 0
  })
  return dir === 'desc' ? sorted.reverse() : sorted
}

/**
 * clamp - 将数值限制在指定范围内
 * 
 * 实现逻辑：
 * ========
 * 1. 使用 Math.min 将数值限制在最大值以下
 * 2. 使用 Math.max 将数值限制在最小值以上
 * 
 * 为什么这样设计？
 * ==============
 * 1. **边界保护**：确保数值在合法范围内
 * 2. **简单高效**：只需要两次数学运算
 * 
 * @param n 输入数值
 * @param min 最小值
 * @param max 最大值
 * @returns 限制在范围内的数值
 */
export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

/**
 * estimateReadingMinutes - 估算阅读时间（分钟）
 * 
 * 实现逻辑：
 * ========
 * 1. 统计中文字符数量
 * 2. 统计英文单词数量（移除中文后按空格分割）
 * 3. 根据阅读速度计算时间
 * 4. 返回至少 1 分钟
 * 
 * 为什么区分中英文？
 * ================
 * 1. **阅读速度不同**：中文阅读速度通常比英文快
 * 2. **准确性**：分开计算更准确
 * 
 * 参数说明：
 * =========
 * @param text 输入文本
 * @param options 配置选项
 * @param options.cnWPM 中文阅读速度（字/分钟，默认 300）
 * @param options.enWPM 英文阅读速度（词/分钟，默认 200）
 * @returns 估算的阅读时间（分钟）
 */
export function estimateReadingMinutes(text = '', { cnWPM = 300, enWPM = 200 } = {}) {
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const words = text.replace(/[\u4e00-\u9fa5]/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(cjk / cnWPM + words / enWPM))
}

/**
 * makeExcerpt - 生成文章摘要
 * 
 * 实现逻辑：
 * ========
 * 1. 移除 Markdown 特殊字符
 * 2. 将多个空格替换为单个空格
 * 3. 去除首尾空格
 * 4. 如果长度超过限制，截取并添加省略号
 * 
 * 为什么这样设计？
 * ==============
 * 1. **可读性**：移除 Markdown 格式后更易阅读
 * 2. **长度控制**：确保摘要在合理范围内
 * 3. **完整性**：保留原文的主要内容
 * 
 * @param text 输入文本
 * @param limit 最大长度（默认 140）
 * @returns 文章摘要
 */
export function makeExcerpt(text = '', limit = 140) {
  const plain = String(text || '')
    .replace(/[#*`>\[\]()_~\n-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > limit ? plain.slice(0, limit) + '…' : plain
}

/** 默认导出所有工具函数 */
export default {
  slugify, pick, omit, groupBy, sortBy, clamp, estimateReadingMinutes, makeExcerpt
}
