// 导出章节完整数据接口，包含关联的课时和练习信息
// 被引用位置：composables/useChapter.ts（类型导入），通过 useChapter 间接被以下页面使用：
//   - pages/course/index.vue（课程首页，展示章节列表）
//   - pages/course/[chapter].vue（章节详情页）
//   - pages/course/[chapter]/[lesson].vue（课时详情页）
//   - pages/exercise/[chapter].vue（章节练习页）
export interface Chapter {
  // 章节唯一标识符，数据库主键
  id: string
  // 章节 URL 友好的短标识，用于路由路径和 API 查询
  slug: string
  // 章节标题名称，用于页面展示
  title: string
  // 章节描述简介，可选字段，用于说明章节内容概要
  description?: string
  // 所属课程的 slug 标识，可选字段
  // 用于按课程筛选章节（GET /api/chapter?course=xxx 的 where 过滤条件）
  // 多个 Chapter 可具有相同的 course 值，表示属于同一课程
  course?: string
  // 章节排序序号，用于控制同一课程下章节的显示顺序
  order: number
  // 章节包含的课时数组，类型为 unknown（后续可细化为 Lesson[]）
  lessons: unknown[]
  // 章节关联的练习数据，可选字段，可能为 null 表示无配套练习
  exercise?: unknown | null
  // 索引签名，允许接口承载额外的未知字段，增强类型扩展性
  [key: string]: unknown
}

// 导出章节列表项接口，用于列表场景的精简数据结构（不含嵌套的 lessons/exercise）
// 被引用位置：composables/useChapter.ts（类型导入）
export interface ChapterListItem {
  // 章节唯一标识符，数据库主键
  id: string
  // 章节 URL 友好的短标识，用于路由跳转
  slug: string
  // 章节标题名称，用于列表展示
  title: string
  // 章节描述简介，可选字段
  description?: string
  // 所属课程的 slug 标识，可选字段
  // 用于按课程筛选章节（GET /api/chapter?course=xxx 的 where 过滤条件）
  course?: string
  // 章节排序序号
  order: number
  // 索引签名，允许扩展字段
  [key: string]: unknown
}

// 导出章节仓储对象，封装章节相关的数据访问方法（Repository 模式）
// 被引用位置：composables/useChapter.ts（直接导入并调用 findAll / findBySlug）
export const ChapterRepository = {
  // 异步方法：查询所有章节列表，支持按课程过滤
  // 流程步骤：
  //   1. 初始化空的查询参数对象 params
  //   2. 若传入 courseSlug，则将其作为 course 查询参数
  //   3. 调用 $fetch 发起 GET 请求获取数据
  //   4. 捕获请求异常，异常时返回空数组降级
  // API 地址：GET /api/chapter
  // query params 结构：{ course?: string }，course 为课程 slug，用于筛选该课程下的章节
  // 返回 Promise<ChapterListItem[]>：成功返回章节列表数组，失败返回空数组
  async findAll(): Promise<ChapterListItem[]> {
    // 开始 try 块，用于捕获网络请求可能抛出的异常
    try {
      // 声明并初始化空的查询参数对象，类型为键值均为 string 的记录
      const params: Record<string, string> = {}
      // 若传入了 courseSlug 参数，则将其赋值给 params.course，作为课程过滤条件
      if (courseSlug) params.course = courseSlug
      // 调用 Nuxt 的 $fetch 方法请求章节列表接口，泛型指定返回类型为 ChapterListItem[]
      // 请求地址为 /api/chapter，携带 params 查询参数
      return await $fetch<ChapterListItem[]>('/api/chapter', { params })
      // 捕获 try 块中抛出的任何异常
    } catch {
      // 请求失败时返回空数组作为降级处理，避免页面渲染报错
      return []
    }
  },

  // 异步方法：根据章节 slug 查询单个章节的完整详情（包含 lessons 和 exercise）
  // 流程步骤：
  //   1. 直接调用 $fetch 发起 GET 请求，slug 作为路径参数
  //   2. 捕获请求异常，异常时返回 null 降级
  // API 地址：GET /api/chapter/{slug}，slug 为 URL 路径参数
  // query params 结构：无额外查询参数
  // 返回 Promise<Chapter | null>：成功返回 Chapter 完整对象，失败返回 null
  async findBySlug(slug: string): Promise<Chapter | null> {
    // 开始 try 块，捕获请求异常
    try {
      // 调用 $fetch 请求章节详情接口，路径中拼接 slug 参数，泛型指定返回类型为 Chapter
      return await $fetch<Chapter>(`/api/chapter/${slug}`)
      // 捕获异常
    } catch {
      // 请求失败时返回 null，表示未找到对应章节
      return null
    }
  },
}
