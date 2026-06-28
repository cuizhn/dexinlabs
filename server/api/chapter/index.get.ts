// 从 h3 框架导入事件处理器定义函数和查询参数获取函数
// defineEventHandler: 定义 Nitro/H3 事件处理器的核心函数
// getQuery: 从请求 URL 中提取查询参数（?key=value 形式）
import { defineEventHandler, getQuery } from 'h3'
// 默认导出事件处理器，接收 H3Event 事件对象，返回异步 Promise
// 该接口处理 GET /api/chapter 请求，用于获取章节列表
export default defineEventHandler(async (event) => {
  // 调用 getQuery 从事件对象中提取所有 URL 查询参数
  // 返回类型为 QueryObject（键值对对象），值可能是 string | string[] | undefined
  const query = getQuery(event)
  // 从查询参数中获取 course 字段，断言为 string 或 undefined 类型
  // course 用于筛选指定课程下的章节，对应 /api/chapter?course=xxx
  const course = query.course as string | undefined

  // queryCollection: Nitro 插件提供的集合查询构造器
  // 参数1: event 事件对象，用于获取上下文（如数据库连接）
  // 参数2: 'chapter' 指定查询的集合/表名
  // .order('order', 'ASC'): 按 order 字段升序排序（ASC=从小到大）
  // 返回链式查询构建器 q，后续可继续追加 where 等条件
  const q = queryCollection(event, 'chapter').order('order', 'ASC')


  // 如果 URL 查询参数中提供了 course，则追加筛选条件
  if (course) {
    // .where('course', '=', course): 条件过滤，仅返回 course 字段等于指定值的记录
    // 三个参数含义：字段名、比较运算符（= 表示相等）、比较值
    q.where('course', '=', course)
  }

   //.all(): 执行查询并返回所有匹配的记录数组
  // 每个元素为 chapter 文档对象，包含字段如: id, slug, title, order, course, lessons 等
  // 无匹配时返回空数组 []
  return await q.all()
})
