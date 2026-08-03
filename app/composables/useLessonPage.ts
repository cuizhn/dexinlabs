/**
 * useLessonPage - 课时页面数据组合式函数
 *
 * 封装课时数据的获取、缓存、Markdown 渲染和响应式状态管理。
 * 调用 /api/lessons/:slug 接口获取原始 Markdown，在 Composable 层调用 @markdown 渲染为 HTML。
 *
 * 渲染职责在 Composable 层完成（调用 @markdown），页面和 Renderer 均不感知 Markdown。
 */
import { computed, ref, watch } from 'vue'
import { useAsyncData } from 'nuxt/app'
import { renderToHTML } from '@markdown'
import type { LessonPage } from '@content'

/**
 * useLessonPage - 获取课时页面数据
 *
 * 通过 $fetch<LessonPage> 让 TypeScript 自动推断 useAsyncData 的泛型，
 * 避免显式泛型参数与 Nuxt 内部类型工具（PickFrom/KeysOf）冲突。
 *
 * @param slug 课时的唯一标识
 * @param options.lazy 是否懒加载（默认 false，服务端预取）
 * @returns 课时、主题、领域、前后课时等响应式数据，含渲染后的 HTML
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

  /** 异步渲染 Markdown → HTML，lesson.body 变化时自动重新渲染 */
  const bodyHtml = ref('')

  watch(
    () => data.value?.lesson?.body,
    async (body) => {
      if (!body?.trim()) {
        bodyHtml.value = ''
        return
      }
      try {
        bodyHtml.value = await renderToHTML(body)
      } catch (err) {
        console.error('[useLessonPage] Markdown 渲染失败:', err)
        bodyHtml.value = ''
      }
    },
    { immediate: true }
  )

  return {
    lesson: computed(() => data.value?.lesson ?? null),
    topic: computed(() => data.value?.topic ?? null),
    domain: computed(() => data.value?.domain ?? null),
    previousLesson: computed(() => data.value?.previousLesson ?? null),
    nextLesson: computed(() => data.value?.nextLesson ?? null),
    bodyHtml,
    loading: pending,
    error,
    refresh
  }
}
