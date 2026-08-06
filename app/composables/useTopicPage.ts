/**
 * useTopicPage - 知识主题页面数据组合式函数
 *
 * 封装主题数据的获取、缓存和响应式状态管理。
 * 调用 /api/topics/:slug 接口，返回主题详情及导航信息。
 *
 * 架构 V4：Course → Topic → Chapter → Lesson
 * 路由：/courses/{topic}
 */
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import type { TopicPage } from '@content'

/**
 * useTopicPage - 获取知识主题页面数据
 *
 * @param slug 主题的唯一标识
 * @param options.lazy 是否懒加载（默认 false，服务端预取）
 * @returns 主题、章节、课时、前后主题等响应式数据
 */
export async function useTopicPage(slug: string, options: { lazy?: boolean } = {}) {
  const key = `topic-page:${slug || 'empty'}`

  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => $fetch<TopicPage>(`/api/topics/${slug}`),
    {
      default: () => ({
        topic: null,
        course: null,
        chapters: [],
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
    chapters: computed(() => data.value?.chapters ?? []),
    lessons: computed(() => data.value?.lessons ?? []),
    exercise: computed(() => data.value?.exercise ?? null),
    previousTopic: computed(() => data.value?.previousTopic ?? null),
    nextTopic: computed(() => data.value?.nextTopic ?? null),
    loading: pending,
    error,
    refresh
  }
}
