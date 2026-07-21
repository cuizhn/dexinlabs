/**
 * useChapterPage - 章节页面数据组合式函数
 *
 * 封装章节数据的获取、缓存和响应式状态管理。
 * 调用 /api/chapter/:slug 接口，返回章节详情及导航信息。
 */
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import type { Chapter, Course, Lesson, Exercise } from '@content/models'

/**
 * useChapterPage - 获取章节页面数据
 * 
 * 实现逻辑：
 * ========
 * 1. 使用 useAsyncData 进行异步数据获取
 * 2. 构造缓存 key（`chapter-page:{slug}`）
 * 3. 通过 $fetch 调用 API 端点 `/api/chapter/{slug}`
 * 4. 返回响应式的数据和状态
 * 
 * 参数说明：
 * =========
 * @param slug 章节的唯一标识
 * @param options 配置选项
 * @param options.lazy 是否懒加载（默认 false，服务端预取）
 * 
 * 返回值：
 * =======
 * - chapter: 当前章节数据（computed）
 * - course: 所属课程数据（computed）
 * - lessons: 章节下的课时列表（computed）
 * - exercise: 章节下的练习（computed）
 * - previousChapter: 上一章节（computed）
 * - nextChapter: 下一章节（computed）
 * - loading: 是否正在加载
 * - error: 错误信息
 * - refresh: 刷新数据方法
 */
export async function useChapterPage(slug: string | undefined, options: { lazy?: boolean } = {}) {
  /** 构造缓存 key，确保不同章节有独立缓存 */
  const key = `chapter-page:${slug || 'empty'}`

  /** 使用 Nuxt 的 useAsyncData 获取异步数据 */
  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => slug ? $fetch(`/api/chapter/${slug}`) : Promise.resolve(null),
    {
      /** 默认值，确保数据结构完整 */
      default: () => ({
        chapter: null,
        course: null,
        lessons: [],
        exercise: null,
        previousChapter: null,
        nextChapter: null
      }),
      /** 服务端预取（默认 true） */
      server: true,
      /** 懒加载模式（默认 false） */
      lazy: options.lazy ?? false
    }
  )

  /** 返回响应式数据和状态 */
  return {
    chapter: computed(() => (data.value as { chapter: Chapter | null })?.chapter ?? null),
    course: computed(() => (data.value as { course: Course | null })?.course ?? null),
    lessons: computed(() => (data.value as { lessons: Lesson[] })?.lessons ?? []),
    exercise: computed(() => (data.value as { exercise: Exercise | null })?.exercise ?? null),
    previousChapter: computed(() => (data.value as { previousChapter: Chapter | null })?.previousChapter ?? null),
    nextChapter: computed(() => (data.value as { nextChapter: Chapter | null })?.nextChapter ?? null),
    loading: pending,
    error,
    refresh
  }
}
