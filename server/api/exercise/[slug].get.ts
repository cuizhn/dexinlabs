// 从 h3 框架（Nuxt 底层 HTTP 框架）导入三个核心工具函数：
//   defineEventHandler: 定义 HTTP 请求处理器的包装函数，统一管理请求生命周期和错误捕获
//   getRouterParam: 从当前请求事件对象中提取动态路由参数（如 [slug] 文件名中的 slug）
//   createError: 创建标准化的 HTTP 错误对象，可设置状态码和消息，会被 h3 自动序列化为响应
import { defineEventHandler, getRouterParam, createError } from 'h3'
// 使用 defineEventHandler 包装整个 API 请求处理流程：
//   整体流程：提取路由参数 → 参数校验 → 查询数据库 → 查询结果校验 → 返回数据
//   该函数接收一个异步回调，回调参数 event 是 H3Event 对象，包含当前请求的全部上下文
//   返回值会被自动序列化为 JSON 响应（Content-Type: application/json）
export default defineEventHandler(async (event) => {
  // 从路由中提取 slug 参数，来源为文件名 [slug].get.ts 中声明的动态路由段
  //   例如请求路径 /api/exercise/python-quiz-1，则 slug 值为 "python-quiz-1"
  //   getRouterParam(event, 'slug') 第二个参数必须与文件名中 [xxx] 的 xxx 完全一致
  const slug = getRouterParam(event, 'slug')

  // 错误处理：参数校验失败，slug 为空或未传
  if (!slug) {
    // 抛出 400 Bad Request 错误，h3 会自动捕获并生成对应的 HTTP 响应
    //   响应体结构示例：{ statusCode: 400, statusMessage: 'Slug is required' }
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required',
    })
  }

  // 调用全局辅助函数 queryCollection 构建数据库查询链式调用
  //   queryCollection(event, 'exercise') 第一个参数传入 event 用于获取请求上下文（如数据库连接、用户鉴权信息等）
  //   第二个参数 'exercise' 指定要查询的集合/表名，返回值为查询构建器实例（QueryBuilder）
  const exercise = await queryCollection(event, 'exercise')
    // where 链式调用：添加过滤条件，相当于 SQL 的 WHERE slug = 'xxx'
    //   参数说明：第一个参数是字段名 'slug'，第二个参数是比较运算符 '='（等于），第三个参数是路由提取的 slug 值
    //   返回值仍为 QueryBuilder 实例，支持继续链式调用其他方法（如 orderBy、limit 等）
    .where('slug', '=', slug)
    // first() 终止链式调用并执行查询：只返回匹配结果的第一条记录（因 slug 通常唯一，设计上只会有一条）
    //   返回数据结构：Promise<Exercise | null>
    //     找到时：解析为 Exercise 对象，包含该条 exercise 记录的全部字段（如 id, slug, title, questions, difficulty 等）
    //     未找到时：解析为 null（不是空数组）
    .first()

  // 错误处理：查询结果为空，说明数据库中不存在该 slug 对应的 exercise 记录
  if (!exercise) {
    // 抛出 404 Not Found 错误，在 statusMessage 中回显用户请求的 slug 便于调试定位
    //   响应体结构示例：{ statusCode: 404, statusMessage: 'Exercise not found: python-quiz-1' }
    throw createError({
      statusCode: 404,
      statusMessage: `Exercise not found: ${slug}`,
    })
  }

  // 查询成功，直接返回 exercise 对象
  //   h3 会自动将其序列化为 JSON 字符串作为 HTTP 响应体返回给客户端
  //   响应状态码默认为 200 OK
  return exercise
})
