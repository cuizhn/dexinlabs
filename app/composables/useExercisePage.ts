/**
 * useExercisePage - 练习页数据组合式函数
 *
 * 封装练习数据的获取、缓存和响应式状态管理。
 * 调用 /api/exercises 接口获取练习页面数据（ExercisePage）。
 * 内容渲染由 Renderer 基于 Exercise AST 驱动（Block → Vue Component）。
 */
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import type { ExercisePage } from '~/learning/view-models'

/**
 * useExercisePage - 获取练习页面数据
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

  /** Exercise AST body blocks，供 ContentRenderer 渲染 */
  const exerciseBlocks = computed(() => exercise.value?.content?.body?.blocks ?? [])

  return {
    exercise,
    topicTitle,
    exerciseBlocks,
    loading,
    error,
    refresh
  }
}
