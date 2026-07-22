/**
 * useTopicPage - 知识主题页面数据组合式函数
 *
 * 封装主题数据的获取、缓存和响应式状态管理。
 * 调用 /api/topics/:slug 接口，返回主题详情及导航信息。
 */
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import type { TopicPage } from '@content/models'

/**
 * useTopicPage - 获取知识主题页面数据
 *
 * 通过 $fetch<TopicPage> 让 TypeScript 自动推断 useAsyncData 的泛型，
 * 避免显式泛型参数与 Nuxt 内部类型工具（PickFrom/KeysOf）冲突。
 *
 * @param slug 主题的唯一标识
 * @param options.lazy 是否懒加载（默认 false，服务端预取）
 * @returns 主题、课程、课时列表、前后主题等响应式数据
 */
export async function useTopicPage(slug: string, options: { lazy?: boolean } = {}) {
  const key = `topic-page:${slug || 'empty'}`

  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => $fetch<TopicPage>(`/api/topics/${slug}`),
    {
      default: () => ({
        topic: null,
        domain: null,
        lessons: [],
        exercise: null,
        previousTopic: null,
        nextTopic: null
      } as unknown as TopicPage),
      server: true,
      lazy: options.lazy ?? false
    }
  )

  return {
    topic: computed(() => data.value?.topic ?? null),
    domain: computed(() => data.value?.domain ?? null),
    lessons: computed(() => data.value?.lessons ?? []),
    exercise: computed(() => data.value?.exercise ?? null),
    previousTopic: computed(() => data.value?.previousTopic ?? null),
    nextTopic: computed(() => data.value?.nextTopic ?? null),
    loading: pending,
    error,
    refresh
  }
}
