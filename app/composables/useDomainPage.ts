/**
 * useDomainPage - 知识领域页面数据组合式函数
 *
 * 封装领域数据的获取、缓存和响应式状态管理。
 * 调用 /api/domains?slug=xxx 接口，返回单个领域及其主题列表。
 */
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import type { DomainPage } from '@content/models'

/**
 * useDomainPage - 获取知识领域页面数据
 *
 * 通过 $fetch<DomainPage> 让 TypeScript 自动推断 useAsyncData 的泛型，
 * 避免显式泛型参数与 Nuxt 内部类型工具（PickFrom/KeysOf）冲突。
 *
 * @param slug 领域的唯一标识（必填）
 * @param options.lazy 是否懒加载（默认 false，服务端预取）
 * @returns 领域和主题列表等响应式数据
 */
export async function useDomainPage(slug: string, options: { lazy?: boolean } = {}) {
  const key = `domain-page:${slug || 'empty'}`

  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => $fetch<DomainPage>('/api/domains', { params: { slug } }),
    {
      default: () => ({
        domain: null,
        topics: []
      } as unknown as DomainPage),
      server: true,
      lazy: options.lazy ?? false
    }
  )

  return {
    domain: computed(() => data.value?.domain ?? null),
    topics: computed(() => data.value?.topics ?? []),
    loading: pending,
    error,
    refresh
  }
}
