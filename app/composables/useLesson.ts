// 导入课时数据类型定义，来源：~/repositories/LessonRepository.ts
// 用途：为 useLesson 内部的响应式变量 lesson 提供 TS 类型约束，确保类型安全
// 包含字段：slug(唯一标识)、title(标题)、description(描述)、order(排序)、body(正文内容)、_path(路径) 等
import type { Lesson } from '~/repositories/LessonRepository'
// 导入课时数据仓库对象，来源：~/repositories/LessonRepository.ts
// 用途：封装课时数据的 API 访问逻辑，本文件通过调用其 findBySlug 方法获取课时详情
// 调用方法：LessonRepository.findBySlug(slug: string) → Promise<Lesson | null>
import { LessonRepository } from '~/repositories/LessonRepository'
// 导入 Vue 3 响应式 API ref，来源：vue 框架核心包
// 用途：创建 lesson 和 loading 两个响应式引用变量，实现数据变化驱动视图更新
import { ref } from 'vue'

// 导出课时管理组合式函数（Vue 3 Composable）
// 调用方搜索：app/pages/course/[chapter]/[lesson].vue:47 处解构调用
// 返回结构：{ lesson: Ref<Lesson | null>, loading: Ref<boolean>, loadLesson: (slug: string) => Promise<void> }
// 数据流向：调用方传入 slug → loadLesson() → LessonRepository.findBySlug() → $fetch API → 结果写入 lesson.value
export function useLesson() {
  // 课时详情响应式变量，初始值为 null，表示尚未加载
  // 类型：Lesson | null；写入时机：loadLesson 执行成功后赋值
  // 读取方：调用方通过 .value 访问，用于渲染页面标题、面包屑、ContentRenderer 内容等
  const lesson = ref<Lesson | null>(null)
  // 加载状态响应式变量，初始值为 false
  // 类型：boolean；true 表示正在请求数据，false 表示请求完成或未开始
  // 读取方：调用方用于展示"加载中"占位文案
  const loading = ref(false)

  // 异步加载指定 slug 对应的课时数据方法
  // 参数：slug - string 类型，课时的唯一标识符，从路由参数 lessonSlug 传入
  // 返回：Promise<void>，无直接返回值，结果通过修改 lesson.value 副作用传递
  // 调用流程：1. 设置 loading=true → 2. try 块调仓库方法 fetch 数据 → 3. finally 确保 loading 重置为 false
  // 异常处理：仓库内部已捕获异常返回 null，此处不额外 try/catch，保证 loading 状态始终正确闭合
  // 调用方：app/pages/course/[chapter]/[lesson].vue:51 在顶层 await 调用，参数为路由 params.lesson
  const loadLesson = async (slug: string): Promise<void> => {
    // 进入加载状态，触发调用方视图显示加载中提示
    loading.value = true
    try {
      // 调用 LessonRepository.findBySlug 请求 /api/lesson/${slug} 接口
      // 返回值类型：Lesson | null；异常时仓库返回 null，lesson 保持 null 状态
      lesson.value = await LessonRepository.findBySlug(slug)
    } finally {
      // 无论请求成功或失败，最终必须重置加载状态，避免 UI 永久停留在加载中
      loading.value = false
    }
  }

  // 返回组合式函数暴露的公共 API
  // lesson：供页面渲染课时标题、正文内容
  // loading：供页面展示加载/完成状态
  // loadLesson：供页面在路由就绪后触发数据拉取
  return {
    lesson,
    loading,
    loadLesson,
  }
}
