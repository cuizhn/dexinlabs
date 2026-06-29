// 文件职责：定义 useChapter 组合式函数（Composable），封装课程章节的状态管理与数据加载逻辑
// 提供章节列表、当前章节详情、加载状态三个响应式状态变量
// 提供 loadChapters（加载章节列表）、loadChapter（加载单个章节详情）两个异步加载方法
// 内部通过调用 ChapterRepository 仓库层与后端 /api/chapter 接口交互
// 被引用文件：
//   1. app/pages/course/index.vue - 课程列表页，使用 chapters/loading/loadChapters
//   2. app/pages/course/[chapter].vue - 章节详情页，使用 currentChapter/loading/loadChapter
//   3. app/pages/course/[chapter]/[lesson].vue - 课时详情页，使用 currentChapter/loadChapter
//   4. app/pages/exercise/[chapter].vue - 章节练习页，使用 currentChapter/loadChapter
// 从 ChapterRepository 导入类型定义
//   Chapter: 完整章节数据接口（包含 lessons、exercise 等关联字段），用于 currentChapter 的类型注解
//   ChapterListItem: 章节列表项接口（精简字段，不含关联数据），用于 chapters 的类型注解
import type { Chapter, ChapterListItem } from '~/repositories/ChapterRepository'
// 从 ChapterRepository 导入仓库对象
//   ChapterRepository: 数据访问层对象，封装了 findAll() 与 findBySlug() 两个静态方法
//     - findAll(courseSlug?): 调用 $fetch GET /api/chapter，返回章节列表 Promise<ChapterListItem[]>
//     - findBySlug(slug): 调用 $fetch GET /api/chapter/:slug，返回单个章节 Promise<Chapter | null>
import { ChapterRepository } from '~/repositories/ChapterRepository'
// 从 vue 导入 ref 函数
//   ref: Vue 3 响应式 API，用于创建包装基本类型/对象的响应式引用（Ref），
//   通过 .value 访问或修改内部值，在模板中自动解包
import { ref } from 'vue'

// 导出 useChapter 组合式函数，作为模块的唯一公开 API
// 调用该函数将返回一组响应式状态变量与加载方法，供页面组件解构使用
export function useChapter() {
  // 响应式变量：章节列表
  // 类型：Ref<ChapterListItem[]>，初始值为空数组 []
  // 存储从 ChapterRepository.findAll() 获取的章节列表数据
  // 被引用方：app/pages/course/index.vue - 用于遍历渲染课程章节卡片
  const chapters = ref<ChapterListItem[]>([])
  // 响应式变量：当前选中的章节详情
  // 类型：Ref<Chapter | null>，初始值为 null
  // 存储从 ChapterRepository.findBySlug() 获取的单个章节完整数据（含 lessons、exercise 等）
  // 被引用方：
  //   - app/pages/course/[chapter].vue - 展示章节标题、描述，从中提取 lessons 列表
  //   - app/pages/course/[chapter]/[lesson].vue - 展示所属章节标题
  //   - app/pages/exercise/[chapter].vue - 展示章节标题
  const currentChapter = ref<Chapter | null>(null)
  // 响应式变量：加载状态标志
  // 类型：Ref<boolean>，初始值为 false
  // 在 loadChapters / loadChapter 执行期间设为 true，用于驱动页面 loading 动画显示
  // 被引用方：
  //   - app/pages/course/index.vue - 章节列表加载中状态
  //   - app/pages/course/[chapter].vue - 章节详情加载中状态
  const loading = ref(false)

  // 异步函数：加载章节列表
  // 参数含义：
  //   courseSlug?: string - 可选参数，课程的 slug 标识字符串
  //     传递值：当需要按课程过滤章节时传入课程 slug；不传则获取全部章节
  //     当前引用方传值：app/pages/course/index.vue 调用 loadChapters()，未传参数，获取全部章节
  // 返回数据结构：Promise<void> - 无直接返回值，结果通过 chapters.value 副作用写入
  // 调用外部方法：ChapterRepository.findAll(courseSlug)
  //   - 参数 courseSlug 原样透传给 findAll，findAll 内部将其作为 { course: courseSlug } 查询参数
  //   - 返回 Promise<ChapterListItem[]>，成功时赋值给 chapters.value，失败时返回空数组（仓库层已处理）
  // 函数流程：
  //   1. 设置 loading.value = true，标记加载开始
  //   2. 进入 try 块，调用 ChapterRepository.findAll(courseSlug) 异步获取数据
  //   3. 将返回的 ChapterListItem[] 赋值给 chapters.value，更新响应式状态
  //   4. 进入 finally 块（无论成功/异常都会执行），设置 loading.value = false，标记加载结束
  const loadChapters = async (courseSlug?: string): Promise<void> => {
    // 标记加载状态为进行中
    loading.value = true
    try {
      // 调用仓库层 findAll 方法获取章节列表，将结果写入 chapters.value
      chapters.value = await ChapterRepository.findAll()
    } finally {
      // 无论成功或异常，确保加载状态被重置为 false
      loading.value = false
    }
  }

  // 异步函数：根据 slug 加载单个章节详情
  // 参数含义：
  //   slug: string - 必填参数，章节的唯一 slug 标识字符串（URL 友好的路径片段）
  //     传递值：从路由 route.params.chapter 中获取，取数组第一个元素或直接使用字符串
  //     当前引用方传值：
  //       - app/pages/course/[chapter].vue: loadChapter(chapterSlug) - 章节页的路由参数
  //       - app/pages/course/[chapter]/[lesson].vue: loadChapter(chapterSlug) - 课时页路由中的章节段
  //       - app/pages/exercise/[chapter].vue: loadChapter(chapterSlug) - 练习页路由参数
  // 返回数据结构：Promise<void> - 无直接返回值，结果通过 currentChapter.value 副作用写入
  // 调用外部方法：ChapterRepository.findBySlug(slug)
  //   - 参数 slug 原样透传给 findBySlug，findBySlug 内部拼接到路径 /api/chapter/${slug}
  //   - 返回 Promise<Chapter | null>，成功时赋值给 currentChapter.value，失败时返回 null（仓库层已处理）
  // 函数流程：
  //   1. 设置 loading.value = true，标记加载开始
  //   2. 进入 try 块，调用 ChapterRepository.findBySlug(slug) 异步获取章节详情
  //   3. 将返回的 Chapter | null 赋值给 currentChapter.value，更新响应式状态
  //   4. 进入 finally 块（无论成功/异常都会执行），设置 loading.value = false，标记加载结束
  const loadChapter = async (slug: string): Promise<void> => {
    // 标记加载状态为进行中
    loading.value = true
    try {
      // 调用仓库层 findBySlug 方法获取单个章节详情，将结果写入 currentChapter.value
      currentChapter.value = await ChapterRepository.findBySlug(slug)
    } finally {
      // 无论成功或异常，确保加载状态被重置为 false
      loading.value = false
    }
  }

  // 返回组合式函数的公开 API 对象
  // 返回数据结构：
  //   {
  //     chapters: Ref<ChapterListItem[]> - 章节列表响应式引用，组件可直接读取或在模板遍历
  //     currentChapter: Ref<Chapter | null> - 当前章节详情响应式引用，为 null 表示未加载/加载失败
  //     loading: Ref<boolean> - 加载状态响应式引用，true 表示正在请求中
  //     loadChapters: (courseSlug?: string) => Promise<void> - 触发章节列表加载的异步方法
  //     loadChapter: (slug: string) => Promise<void> - 触发单章节加载的异步方法
  //   }
  // 组件使用方式：const { chapters, currentChapter, loading, loadChapters, loadChapter } = useChapter()
  return {
    // 章节列表响应式变量
    chapters,
    // 当前章节详情响应式变量
    currentChapter,
    // 加载状态响应式变量
    loading,
    // 加载章节列表方法
    loadChapters,
    // 加载单个章节方法
    loadChapter,
  }
}
