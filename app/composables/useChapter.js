/**
 * useChapter - 章节数据组合式函数（JavaScript 版本）
 * 
 * 设计意图：
 * =========
 * 封装章节数据的获取逻辑，支持列表查询和单个查询两种模式。
 * 
 * 为什么需要 JavaScript 版本？
 * =========================
 * 为了兼容旧代码和简化使用场景，提供更灵活的参数接口。
 * 
 * 为什么使用组合式函数？
 * ===================
 * 1. **逻辑复用**：相同的数据获取逻辑可以在多个组件中复用
 * 2. **响应式**：与 Vue 3 的响应式系统无缝集成
 * 3. **可测试性**：便于单元测试
 * 4. **关注点分离**：将数据获取逻辑与组件渲染逻辑分离
 * 
 * 替代方案对比：
 * =============
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | **组合式函数** | 逻辑复用，响应式，可测试 | 需要理解 Vue 3 组合式 API |
 * | 直接在组件中写逻辑 | 简单直接 | 代码重复，难以维护 |
 * | Vuex/Pinia | 全局状态管理 | 过度设计，增加复杂度 |
 * 
 * 本方案优势：
 * ===========
 * - **灵活参数**：支持列表模式和单个模式两种调用方式
 * - **逻辑复用**：多个页面可以共享相同的数据获取逻辑
 * - **响应式**：返回的数据自动响应变化
 * - **加载状态**：提供 loading 和 error 状态，便于 UI 处理
 * - **刷新能力**：提供 refresh 方法，支持手动刷新数据
 * 
 * 使用方式：
 * ========
 * // 获取章节列表（可选按课程过滤）
 * const { chapters, loading, error } = await useChapter({ course: 'math' })
 * 
 * // 获取单个章节
 * const { currentChapter, currentExercise, loading } = await useChapter('intro')
 */
import { computed } from 'vue'

/**
 * useChapter - 获取章节数据
 * 
 * 实现逻辑：
 * ========
 * 1. 判断调用模式：如果 slugOrOpts 是 null 或对象，则为列表模式；否则为单个模式
 * 2. 使用 useAsyncData 进行异步数据获取
 * 3. 根据模式调用不同的 API 端点
 * 4. 返回响应式的数据和状态
 * 
 * 参数说明：
 * =========
 * @param slugOrOpts 章节的唯一标识（单个模式）或配置选项（列表模式）
 * @param opts 配置选项（仅在单个模式下生效）
 * @param opts.course 课程的唯一标识（列表模式下用于过滤）
 * @param opts.lazy 是否懒加载（默认 false，服务端预取）
 * 
 * 返回值（列表模式）：
 * =======
 * - chapters: 章节列表
 * - loading: 是否正在加载
 * - error: 错误信息
 * - refresh: 刷新数据方法
 * 
 * 返回值（单个模式）：
 * =======
 * - data: 原始数据
 * - currentChapter: 当前章节数据（computed）
 * - currentExercise: 当前练习数据（computed）
 * - loading: 是否正在加载
 * - error: 错误信息
 * - refresh: 刷新数据方法
 */
export async function useChapter(slugOrOpts = null, opts = {}) {
  /** 判断调用模式 */
  const isList = slugOrOpts === null || typeof slugOrOpts === 'object'

  /** 合并配置选项 */
  const options = isList ? (slugOrOpts || {}) : opts

  /** 列表模式：获取章节列表 */
  if (isList) {
    /** 提取课程参数 */
    const course = options.course || null

    /** 构造缓存 key */
    const key = `chapters:list:${course || 'all'}`

    /** 使用 Nuxt 的 useAsyncData 获取异步数据 */
    const { data, pending, error, refresh } = await useAsyncData(
      key,
      () => $fetch('/api/chapter', { params: course ? { course } : {} }),
      {
        /** 默认值为空数组 */
        default: () => [],
        /** 服务端预取 */
        server: true,
        /** 懒加载模式 */
        lazy: options.lazy ?? false,
        /** 合并额外选项 */
        ...options
      }
    )

    /** 返回列表模式的结果 */
    return {
      chapters: data,
      loading: pending,
      error,
      refresh
    }
  }

  /** 单个模式：获取单个章节 */
  const slug = slugOrOpts

  /** 构造缓存 key */
  const key = `chapter:${slug}`

  /** 使用 Nuxt 的 useAsyncData 获取异步数据 */
  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => $fetch(`/api/chapter/${slug}`),
    {
      /** 默认值 */
      default: () => ({ chapter: null, exercise: null }),
      /** 服务端预取 */
      server: true,
      /** 懒加载模式 */
      lazy: options.lazy ?? false,
      /** 合并额外选项 */
      ...options
    }
  )

  /** 计算属性：当前章节 */
  const currentChapter = computed(() => data.value?.chapter ?? null)

  /** 计算属性：当前练习 */
  const currentExercise = computed(() => data.value?.exercise ?? null)

  /** 返回单个模式的结果 */
  return {
    data,
    currentChapter,
    currentExercise,
    loading: pending,
    error,
    refresh
  }
}
