/**
 * useExercisePage - 练习页数据组合式函数
 *
 * 封装练习数据的获取、Markdown 渲染和响应式状态管理。
 * 调用 /api/exercises 接口获取题目列表，将第一道题的 Markdown 正文渲染为 HTML，
 * 供 Renderer.vue 直接展示。
 *
 * 渲染职责在 composable 层完成（调用 @markdown），页面和 Renderer 均不感知 Markdown。
 */
import { computed, ref, watch } from 'vue'
import { useAsyncData } from 'nuxt/app'
import { renderToHTML } from '@markdown'
import type { Exercise } from '@content'

/** 练习 API 返回结构 */
interface ExerciseResponse {
  exercises: Exercise[]
  topicTitle: string
}

/**
 * useExercisePage - 获取练习页面数据
 *
 * 通过 topicSlug 获取对应主题的练习题，
 * 自动将第一道题的 body（Markdown）渲染为 HTML。
 *
 * @param topicSlug 返回主题 slug 的响应式函数
 * @returns 练习 HTML、题目元数据、加载状态
 */
export async function useExercisePage(topicSlug: () => string) {
  const { data: exerciseData, pending: loading, error, refresh } = await useAsyncData(
    () => `exercises:${topicSlug()}`,
    () => $fetch<ExerciseResponse>('/api/exercises', { params: { topic: topicSlug() } }),
    { default: () => ({ exercises: [], topicTitle: '' }) as ExerciseResponse }
  )

  const exercise = computed(() => {
    const list = exerciseData.value?.exercises
    if (Array.isArray(list) && list.length > 0) return list[0]
    return null
  })

  const topicTitle = computed(() => exerciseData.value?.topicTitle || '')

  /** 异步渲染 Markdown → HTML，exercise.body 变化时自动重新渲染 */
  const exerciseHtml = ref('')

  watch(
    () => exercise.value?.body,
    async (body) => {
      if (!body?.trim()) {
        exerciseHtml.value = ''
        return
      }
      try {
        exerciseHtml.value = await renderToHTML(body)
      } catch (error) {
        console.error('[useExercisePage] Markdown 渲染失败:', error)
        exerciseHtml.value = ''
      }
    },
    { immediate: true }
  )

  return {
    exercise,
    topicTitle,
    exerciseHtml,
    loading,
    error,
    refresh
  }
}
