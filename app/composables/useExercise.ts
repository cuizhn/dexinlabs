// 导入练习数据类型定义，来源：~/repositories/ExerciseRepository.ts
// 用途：为 useExercise 内部的响应式变量 exercise 提供 TS 类型约束，确保类型安全
// 包含字段：slug(唯一标识)、title(标题)、description(描述，可选)、questions(题目列表，可选) 等
import type { Exercise } from '~/repositories/ExerciseRepository'
// 导入练习数据仓库对象，来源：~/repositories/ExerciseRepository.ts
// 用途：封装练习数据的 API 访问逻辑，本文件通过调用其 findBySlug 方法获取章节练习详情
// 调用方法：ExerciseRepository.findBySlug(slug: string) → Promise<Exercise | null>
import { ExerciseRepository } from '~/repositories/ExerciseRepository'
// 导入 Vue 3 响应式 API ref，来源：vue 框架核心包
// 用途：创建 exercise 和 loading 两个响应式引用变量，实现数据变化驱动视图更新
import { ref } from 'vue'

// 导出练习管理组合式函数（Vue 3 Composable）
// 调用方搜索：app/pages/exercise/[chapter].vue:71 处解构调用
// 返回结构：{ exercise: Ref<Exercise | null>, loading: Ref<boolean>, loadExercise: (slug: string) => Promise<void> }
// 数据流向：调用方传入 slug → loadExercise() → ExerciseRepository.findBySlug() → $fetch API → 结果写入 exercise.value
export function useExercise() {
  // 练习详情响应式变量，初始值为 null，表示尚未加载
  // 类型：Exercise | null；写入时机：loadExercise 执行成功后赋值
  // 读取方：调用方通过 .value 访问，用于渲染页面标题、介绍描述、ContentRenderer 内容等
  const exercise = ref<Exercise | null>(null)
  // 加载状态响应式变量，初始值为 false
  // 类型：boolean；true 表示正在请求数据，false 表示请求完成或未开始
  // 读取方：调用方用于展示"练习内容加载中..."占位文案
  const loading = ref(false)

  // 异步加载指定 slug 对应的章节练习数据方法
  // 参数：slug - string 类型，章节的唯一标识符，从路由参数 chapterSlug 传入
  // 返回：Promise<void>，无直接返回值，结果通过修改 exercise.value 副作用传递
  // 调用流程：1. 设置 loading=true → 2. try 块调仓库方法 fetch 数据 → 3. finally 确保 loading 重置为 false
  // 异常处理：仓库内部已捕获异常返回 null，此处不额外 try/catch，保证 loading 状态始终正确闭合
  // 调用方：app/pages/exercise/[chapter].vue:76 在 loadChapter 之后 await 调用，参数为路由 params.chapter
  const loadExercise = async (slug: string): Promise<void> => {
    // 进入加载状态，触发调用方视图显示加载中提示
    loading.value = true
    try {
      // 调用 ExerciseRepository.findBySlug 请求 /api/exercise/${slug} 接口
      // 返回值类型：Exercise | null；异常时仓库返回 null，exercise 保持 null 状态（页面显示占位卡片）
      exercise.value = await ExerciseRepository.findBySlug(slug)
    } finally {
      // 无论请求成功或失败，最终必须重置加载状态，避免 UI 永久停留在加载中
      loading.value = false
    }
  }

  // 返回组合式函数暴露的公共 API
  // exercise：供页面渲染练习标题、描述、交互内容
  // loading：供页面展示加载/完成状态
  // loadExercise：供页面在路由就绪且章节加载完成后触发练习数据拉取
  return {
    exercise,
    loading,
    loadExercise,
  }
}
