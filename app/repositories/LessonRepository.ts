// 导出课时数据接口，描述单个课时的完整信息
// 被引用位置：
//   - composables/useLesson.ts（类型导入），通过 useLesson 间接被 pages/course/[chapter]/[lesson].vue（课时详情页）使用
//   - pages/course/[chapter].vue（直接类型导入，用于章节页内的课时列表展示）
export interface Lesson {
  // 课时 URL 友好的短标识，用于路由路径和 API 查询
  slug: string
  // 课时标题名称，用于页面展示
  title: string
  // 课时描述简介，说明课时内容要点
  description: string
  // 课时排序序号，可选字段，用于控制同一章节下课时的显示顺序
  order?: number
  // 课时正文内容，可选字段，类型为 unknown（后续可细化为具体的内容块结构，如富文本/Markdown 内容数组）
  body?: unknown
  // 课时页面的路由路径，可选字段，Nuxt Content 文档驱动时可能自动生成的内部路径
  _path?: string
  // 索引签名，允许接口承载额外的未知字段，增强类型扩展性
  [key: string]: unknown
}

// 导出课时仓储对象，封装课时相关的数据访问方法（Repository 模式）
// 被引用位置：composables/useLesson.ts（直接导入并调用 findBySlug）
export const LessonRepository = {
  // 异步方法：根据课时 slug 查询单个课时的完整详情
  // 流程步骤：
  //   1. 直接调用 $fetch 发起 GET 请求，slug 作为路径参数
  //   2. 捕获请求异常，异常时返回 null 降级
  // API 地址：GET /api/lesson/{slug}，slug 为 URL 路径参数
  // query params 结构：无额外查询参数
  // 返回 Promise<Lesson | null>：成功返回 Lesson 完整对象，失败返回 null
  async findBySlug(slug: string): Promise<Lesson | null> {
    // 开始 try 块，用于捕获网络请求可能抛出的异常
    try {
      // 调用 Nuxt 的 $fetch 方法请求课时详情接口，路径中拼接 slug 参数，泛型指定返回类型为 Lesson
      return await $fetch<Lesson>(`/api/lesson/${slug}`)
      // 捕获 try 块中抛出的任何异常
    } catch {
      // 请求失败时返回 null，表示未找到对应课时
      return null
    }
  },
}
