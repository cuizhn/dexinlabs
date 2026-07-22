/**
 * useKnowledgeMap - 知识地图页数据组合式函数
 *
 * 封装全部知识领域及其主题的获取、缓存和响应式状态管理。
 * 调用 /api/domains 接口（无 slug 参数），返回 DomainPage[] 列表。
 */
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import type { DomainPage } from '@content/models'

/**
 * useKnowledgeMap - 获取知识地图页面数据
 *
 * 通过 $fetch<DomainPage[]> 让 TypeScript 自动推断 useAsyncData 的泛型，
 * 避免显式泛型参数与 Nuxt 内部类型工具（PickFrom/KeysOf）冲突。
 *
 * @returns 领域列表（含主题）和加载状态
 */
export async function useKnowledgeMap() {
  const { data, pending, error, refresh } = await useAsyncData(
    'knowledge-map',
    () => $fetch<DomainPage[]>('/api/domains'),
    {
      default: () => [] as DomainPage[],
      server: true,
      lazy: false
    }
  )

  return {
    /** 所有领域及其主题列表 */
    domains: computed(() => data.value ?? []),
    loading: pending,
    error,
    refresh
  }
}
