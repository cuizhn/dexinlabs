/**
 * useCoursePage - 课程页面数据组合式函数
 * 
 * 设计意图：
 * =========
 * 封装课程页面的数据获取逻辑，提供响应式的数据和加载状态。
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
 * - **逻辑复用**：多个页面可以共享相同的数据获取逻辑
 * - **响应式**：返回的 computed 属性自动响应数据变化
 * - **加载状态**：提供 loading 和 error 状态，便于 UI 处理
 * - **刷新能力**：提供 refresh 方法，支持手动刷新数据
 * - **默认课程**：支持不传 slug 获取默认课程
 * 
 * 使用方式：
 * ========
 * // 获取指定课程
 * const { course, chapters, loading, error } = await useCoursePage('math-fundamentals')
 * 
 * // 获取默认课程
 * const { course, chapters } = await useCoursePage()
 */
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'

/**
 * useCoursePage - 获取课程页面数据
 * 
 * 实现逻辑：
 * ========
 * 1. 使用 useAsyncData 进行异步数据获取
 * 2. 根据是否提供 slug 构造不同的缓存 key
 * 3. 通过 $fetch 调用 API 端点 `/api/course`
 * 4. 返回响应式的数据和状态
 * 
 * 参数说明：
 * =========
 * @param slug 课程的唯一标识（可选，不传则获取默认课程）
 * @param options 配置选项
 * @param options.lazy 是否懒加载（默认 false，服务端预取）
 * 
 * 返回值：
 * =======
 * - course: 当前课程数据（computed）
 * - chapters: 课程下的章节列表（computed）
 * - loading: 是否正在加载
 * - error: 错误信息
 * - refresh: 刷新数据方法
 */
export async function useCoursePage(slug?: string, options: { lazy?: boolean } = {}) {
  /** 构造缓存 key，默认课程使用固定 key */
  const key = slug ? `course-page:${slug}` : 'course-page:default'

  /** 使用 Nuxt 的 useAsyncData 获取异步数据 */
  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => $fetch('/api/course', { params: slug ? { slug } : {} }),
    {
      /** 默认值，确保数据结构完整 */
      default: () => ({
        course: null,
        chapters: []
      }),
      /** 服务端预取（默认 true） */
      server: true,
      /** 懒加载模式（默认 false） */
      lazy: options.lazy ?? false
    }
  )

  /** 返回响应式数据和状态 */
  return {
    course: computed(() => (data.value as Record<string, unknown>)?.course ?? null),
    chapters: computed(() => (data.value as Record<string, unknown>)?.chapters ?? []),
    loading: pending,
    error,
    refresh
  }
}
