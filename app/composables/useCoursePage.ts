/**
 * useCoursePage - 课程页面数据组合式函数
 *
 * 封装课程数据的获取、缓存和响应式状态管理。
 * 调用 /api/course 接口，返回课程及章节列表。
 */
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import type { Course, Chapter } from '@content/models'

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
    course: computed(() => (data.value as { course: Course | null })?.course ?? null),
    chapters: computed(() => (data.value as { chapters: Chapter[] })?.chapters ?? []),
    loading: pending,
    error,
    refresh
  }
}
