/**
 * useCourseCatalog - 课程目录页数据组合式函数
 *
 * 调用 /api/courses?catalog=true 获取完整课程目录层级：
 * Topic → Chapter → Lesson，用于 /courses 课程目录页。
 */
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import type { CatalogTopic } from '~/content/view-models'

export async function useCourseCatalog() {
  const { data, pending, error, refresh } = await useAsyncData(
    'course-catalog',
    () => $fetch<CatalogTopic[]>('/api/courses', {
      query: { catalog: 'true' }
    }),
    {
      default: () => [] as CatalogTopic[],
      server: true,
      lazy: false
    }
  )

  return {
    catalog: computed(() => data.value ?? []),
    loading: pending,
    error,
    refresh
  }
}
