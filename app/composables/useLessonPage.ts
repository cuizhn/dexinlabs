/**
 * useLessonPage - 课时页面数据组合式函数
 *
 * 架构 V5（三层 identity）：Lesson 唯一约束为 (topic_slug, chapter_slug, lesson_slug)，
 * 需要同时提供 topicSlug、chapterSlug 和 lessonSlug。
 *
 * 路由：/courses/{topicSlug}/{chapterSlug}/{lessonSlug}
 */
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import type { LessonPage } from '~/content/view-models'

/**
 * useLessonPage - 获取课时页面数据
 *
 * @param topicSlug 主题的唯一标识
 * @param chapterSlug 章节的唯一标识
 * @param lessonSlug 课时的唯一标识
 * @param options.lazy 是否懒加载（默认 false，服务端预取）
 * @returns 课时、主题、章节、前后课时等响应式数据
 */
export async function useLessonPage(
  topicSlug: string,
  chapterSlug: string,
  lessonSlug: string,
  options: { lazy?: boolean } = {}
) {
  const key = `lesson-page:${topicSlug}:${chapterSlug}:${lessonSlug || 'empty'}`

  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => $fetch<LessonPage>(`/api/lessons/${lessonSlug}`, {
      query: { topic: topicSlug, chapter: chapterSlug }
    }),
    {
      default: () => ({
        lesson: null,
        topic: null,
        course: null,
        chapter: null,
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
    chapter: computed(() => data.value?.chapter ?? null),
    previousLesson: computed(() => data.value?.previousLesson ?? null),
    nextLesson: computed(() => data.value?.nextLesson ?? null),
    loading: pending,
    error,
    refresh
  }
}
