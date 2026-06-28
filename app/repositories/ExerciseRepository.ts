// 导出练习数据接口，描述单个练习的完整信息（含题目数组）
// 被引用位置：composables/useExercise.ts（类型导入），通过 useExercise 间接被 pages/exercise/[chapter].vue（章节练习页）使用
export interface Exercise {
  // 练习 URL 友好的短标识，用于路由路径和 API 查询，通常与对应章节 slug 一致
  slug: string
  // 练习标题名称，用于页面展示
  title: string
  // 练习描述简介，可选字段，用于说明练习目的、答题规则等说明信息
  description?: string
  // 练习题目的数组，可选字段，类型为 unknown[]（后续可细化为 Question[]，每个 Question 包含题干、选项、答案等字段）
  questions?: unknown[]
  // 索引签名，允许接口承载额外的未知字段，增强类型扩展性
  [key: string]: unknown
}

// 导出练习仓储对象，封装练习相关的数据访问方法（Repository 模式）
// 被引用位置：composables/useExercise.ts（直接导入并调用 findBySlug）
export const ExerciseRepository = {
  // 异步方法：根据练习 slug 查询单个练习的完整详情（含题目列表）
  // 流程步骤：
  //   1. 直接调用 $fetch 发起 GET 请求，slug 作为路径参数
  //   2. 捕获请求异常，异常时返回 null 降级
  // API 地址：GET /api/exercise/{slug}，slug 为 URL 路径参数
  // query params 结构：无额外查询参数
  // 返回 Promise<Exercise | null>：成功返回 Exercise 完整对象（含 questions 数组），失败返回 null
  async findBySlug(slug: string): Promise<Exercise | null> {
    // 开始 try 块，用于捕获网络请求可能抛出的异常
    try {
      // 调用 Nuxt 的 $fetch 方法请求练习详情接口，路径中拼接 slug 参数，泛型指定返回类型为 Exercise
      return await $fetch<Exercise>(`/api/exercise/${slug}`)
      // 捕获 try 块中抛出的任何异常
    } catch {
      // 请求失败时返回 null，表示未找到对应练习
      return null
    }
  },
}
