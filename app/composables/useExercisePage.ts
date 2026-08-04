/**
 * useExercisePage - 练习页数据组合式函数
 *
 * 封装练习数据的获取、缓存和响应式状态管理。
 * 调用 /api/exercises 接口获取练习页面数据（ExercisePage）。
 * Markdown 渲染已在 Service 层完成，Composable 只消费 bodyHtml。
 */
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import type { ExercisePage } from '@content'

/**
 * useExercisePage - 获取练习页面数据
 *
 * 通过 topicSlug 获取对应主题的练习题，
 * Service 层已完成 Markdown → HTML 渲染，直接消费 bodyHtml。
 *
 * @param topicSlug 返回主题 slug 的响应式函数
 * @returns 练习数据、题目元数据、加载状态
 */
export async function useExercisePage(topicSlug: () => string) {
  const { data, pending: loading, error, refresh } = await useAsyncData(
    () => `exercise-page:${topicSlug()}`,
    () => $fetch<ExercisePage>('/api/exercises', { params: { topic: topicSlug() } }),
    { default: () => ({ exercise: null, topicTitle: '' }) as ExercisePage }
  )

  const exercise = computed(() => data.value?.exercise ?? null)
  const topicTitle = computed(() => data.value?.topicTitle ?? '')
  const exerciseHtml = computed(() => exercise.value?.bodyHtml ?? '')

  return {
    exercise,
    topicTitle,
    exerciseHtml,
    loading,
    error,
    refresh
  }
}
