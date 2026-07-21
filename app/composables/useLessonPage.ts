/**
 * useLessonPage - 课时页面数据组合式函数
 *
 * 封装课时数据的获取、缓存和响应式状态管理。
 * 调用 /api/lesson/:slug 接口，返回课时详情及导航信息。
 */
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import type { Lesson, Chapter, Course } from '@content/models'

/**
 * useLessonPage - 获取课时页面数据
 * 
 * 实现逻辑：
 * ========
 * 1. 使用 useAsyncData 进行异步数据获取
 * 2. 构造缓存 key（`lesson-page:{slug}`）
 * 3. 通过 $fetch 调用 API 端点 `/api/lesson/{slug}`
 * 4. 返回响应式的数据和状态
 * 
 * 参数说明：
 * =========
 * @param slug 课时的唯一标识
 * @param options 配置选项
 * @param options.lazy 是否懒加载（默认 false，服务端预取）
 * 
 * 返回值：
 * =======
 * - lesson: 当前课时数据（computed）
 * - chapter: 所属章节数据（computed）
 * - course: 所属课程数据（computed）
 * - previousLesson: 上一课时（computed）
 * - nextLesson: 下一课时（computed）
 * - loading: 是否正在加载
 * - error: 错误信息
 * - refresh: 刷新数据方法
 */
export async function useLessonPage(slug: string | undefined, options: { lazy?: boolean } = {}) {
  /** 构造缓存 key，确保不同课时有独立缓存 */
  const key = `lesson-page:${slug || 'empty'}`

  /** 使用 Nuxt 的 useAsyncData 获取异步数据 */
  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => slug ? $fetch(`/api/lesson/${slug}`) : Promise.resolve(null),
    {
      /** 默认值，确保数据结构完整 */
      default: () => ({
        lesson: null,
        chapter: null,
        course: null,
        previousLesson: null,
        nextLesson: null
      }),
      /** 服务端预取（默认 true） */
      server: true,
      /** 懒加载模式（默认 false） */
      lazy: options.lazy ?? false
    }
  )

  /** 返回响应式数据和状态 */
  return {
    lesson: computed(() => (data.value as { lesson: Lesson | null })?.lesson ?? null),
    chapter: computed(() => (data.value as { chapter: Chapter | null })?.chapter ?? null),
    course: computed(() => (data.value as { course: Course | null })?.course ?? null),
    previousLesson: computed(() => (data.value as { previousLesson: Lesson | null })?.previousLesson ?? null),
    nextLesson: computed(() => (data.value as { nextLesson: Lesson | null })?.nextLesson ?? null),
    loading: pending,
    error,
    refresh
  }
}
