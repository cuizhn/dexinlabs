/**
 * useLessonPage - 课时页面数据组合式函数
 *
 * 封装课时数据的获取、缓存和响应式状态管理。
 * 调用 /api/lessons/:slug 接口，返回课时详情及导航信息。
 */
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import type { LessonPage } from '@content/models'

/**
 * useLessonPage - 获取课时页面数据
 *
 * 通过 $fetch<LessonPage> 让 TypeScript 自动推断 useAsyncData 的泛型，
 * 避免显式泛型参数与 Nuxt 内部类型工具（PickFrom/KeysOf）冲突。
 *
 * @param slug 课时的唯一标识
 * @param options.lazy 是否懒加载（默认 false，服务端预取）
 * @returns 课时、主题、领域、前后课时等响应式数据
 */
export async function useLessonPage(slug: string, options: { lazy?: boolean } = {}) {
  const key = `lesson-page:${slug || 'empty'}`

  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => $fetch<LessonPage>(`/api/lessons/${slug}`),
    {
      default: () => ({
        lesson: null,
        topic: null,
        domain: null,
        previousLesson: null,
        nextLesson: null
      } as unknown as LessonPage),
      server: true,
      lazy: options.lazy ?? false
    }
  )

  return {
    lesson: computed(() => data.value?.lesson ?? null),
    topic: computed(() => data.value?.topic ?? null),
    domain: computed(() => data.value?.domain ?? null),
    previousLesson: computed(() => data.value?.previousLesson ?? null),
    nextLesson: computed(() => data.value?.nextLesson ?? null),
    loading: pending,
    error,
    refresh
  }
}
