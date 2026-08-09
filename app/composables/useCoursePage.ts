/**
 * useCoursePage - 课程知识地图页数据组合式函数
 *
 * 封装课程分组的获取、缓存和响应式状态管理。
 * 调用 /api/courses 接口获取按 Course 分组的 Topic 列表，用于 /courses 知识地图页。
 *
 * 架构 V4：Course → Topic → Chapter → Lesson
 */
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import type { CoursePage } from '~/types/pages'

/**
 * useCoursePage - 获取课程知识地图页面数据
 *
 * @returns 按课程分组的主题列表和加载状态
 */
export async function useCoursePage() {
  const { data, pending, error, refresh } = await useAsyncData(
    'course-page',
    () => $fetch<CoursePage[]>('/api/courses'),
    {
      default: () => [] as CoursePage[],
      server: true,
      lazy: false
    }
  )

  return {
    /** 按课程分组的主题列表 */
    courses: computed(() => data.value ?? []),
    loading: pending,
    error,
    refresh
  }
}
