// 从 h3 框架导入所需的工具函数
// defineEventHandler: 定义事件处理器的核心函数
// getRouterParam: 从动态路由路径中提取命名参数（如 [slug] 部分）
// createError: 创建标准化的 HTTP 错误对象并抛出
import { defineEventHandler, getRouterParam, createError } from 'h3'
// 默认导出事件处理器，处理 GET /api/chapter/:slug 动态路由请求
// 根据章节 slug 获取单个章节详情，包含关联的课时列表和练习数据
export default defineEventHandler(async (event) => {
  // getRouterParam 从动态路由 [slug] 中提取参数值
  // 路由来源: 文件名 [slug].get.ts 中的 slug 即为路由参数名
  // 例如请求 /api/chapter/intro-to-js，则 slug = 'intro-to-js'
  // 返回类型为 string | undefined（若路由匹配异常可能为 undefined）
  const slug = getRouterParam(event, 'slug')

  // 校验 slug 参数是否存在，缺失则返回 400 Bad Request
  if (!slug) {
    // createError 抛出 HTTP 错误，包含状态码和状态信息
    // statusCode: 400 表示客户端请求参数错误
    // statusMessage: 错误描述文本，会作为响应体返回
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required',
    })
  }

  // 查询 chapter 集合中 slug 匹配的单条记录
  // queryCollection(event, 'chapter'): 构建 chapter 集合查询
  // .where('slug', '=', slug): 过滤条件：slug 字段等于路由参数 slug
  // .first(): 执行查询并返回第一条匹配的记录对象（非数组），无匹配返回 null
  const chapter = await queryCollection(event, 'chapter')
    .where('slug', '=', slug)
    .first()

  // 若未找到对应章节，抛出 404 Not Found 错误
  if (!chapter) {
    // statusCode: 404 表示请求的资源不存在
    // statusMessage 动态拼接 slug，便于定位是哪个 slug 未找到
    throw createError({
      statusCode: 404,
      statusMessage: `Chapter not found: ${slug}`,
    })
  }

  // 从 chapter 文档中提取 lessons 字段，规范化为字符串数组
  // lessons 预期存储的是 lesson 的 slug 引用数组（如 ['lesson-1', 'lesson-2']）
  // 若 lessons 不是数组则降级为空数组，避免后续处理报错
  const lessonSlugs = Array.isArray((chapter as any).lessons)
    ? (chapter as any).lessons as string[]
    : []

  // 如果存在关联的课时 slug，则批量查询对应的 lesson 记录
  const lessons = lessonSlugs.length
    // queryCollection(event, 'lesson'): 构建 lesson 集合查询
    // .where('slug', 'in', lessonSlugs): 使用 in 运算符，匹配 slug 字段在 lessonSlugs 数组中的任意记录
    // .all(): 返回所有匹配的 lesson 对象数组，顺序取决于数据库返回顺序（非原始顺序）
    ? await queryCollection(event, 'lesson')
        .where('slug', 'in', lessonSlugs)
        .all()
    // 无课时 slug 则返回空数组，保证后续处理类型一致
    : []

  // 将查询到的 lessons 按 lessonSlugs 原始顺序重新排序
  // 因为 where in 查询返回的顺序不保证与输入数组一致，需手动恢复原顺序
  // map + find: 按每个 slug 在 lessons 数组中查找对应对象
  // filter(Boolean): 过滤掉未找到的 undefined 项（如 slug 引用失效时）
  const sortedLessons = lessonSlugs
    .map((s) => lessons.find((l: any) => l.slug === s))
    .filter(Boolean)

  // 声明 exercise 变量，初始值为 null，类型为 unknown（后续查询结果类型不确定）
  let exercise: unknown = null
  try {
    // 查询 exercise 集合中与章节 slug 相同的记录
    // 约定：练习的 slug 与对应章节的 slug 保持一致，形成一一关联
    // queryCollection(event, 'exercise'): 构建 exercise 集合查询
    // .where('slug', '=', slug): 筛选 slug 等于当前章节 slug 的练习
    // .first(): 返回单条练习记录，无匹配返回 null
    exercise = await queryCollection(event, 'exercise')
      .where('slug', '=', slug)
      .first()
  } catch {
    // 若查询过程中出现异常（如 exercise 集合不存在、权限问题等），静默失败
    // 不抛错中断整个接口，exercise 保持 null，降级处理
    exercise = null
  }

  // 返回最终响应对象，合并章节信息、排序后的课时列表、练习数据
  // 使用展开运算符展开 chapter 的所有字段，作为响应的基础字段
  // 显式覆盖 lessons 字段（使用排序后的 sortedLessons，而非 chapter.lessons 中的 slug 数组）
  // 显式添加 exercise 字段（可能为练习对象或 null）
  // 响应字段示例: { id, slug, title, order, course, lessons: [...], exercise: {...}|null }
  return {
    ...(chapter as Record<string, unknown>),
    lessons: sortedLessons,
    exercise,
  }
})
