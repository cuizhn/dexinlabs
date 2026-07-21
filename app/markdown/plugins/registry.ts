/**
 * Markdown 插件注册中心
 *
 * 维护全局插件列表，支持注册、注销、排序和清空操作。
 * 插件按 order 值升序排列，数值越小越先执行。
 */
import type { MarkdownPlugin } from '../types'

/**
 * 全局插件列表（进程级别）
 * 注意：此状态在 SSR 环境下跨请求共享，不应在请求处理过程中动态修改
 */
let plugins: MarkdownPlugin[] = []

/**
 * 注册或更新一个 Markdown 插件
 *
 * 如果同名插件已存在则更新，否则追加。
 * 插件自带 order 优先于参数 order，两者都未指定时默认 100。
 */
export function registerPlugin(plugin: MarkdownPlugin, order: number = 100): void {
  const existingIndex = plugins.findIndex(p => p.name === plugin.name)
  if (existingIndex >= 0) {
    plugins[existingIndex] = { ...plugin, order: plugin.order ?? order }
  } else {
    plugins.push({ ...plugin, order: plugin.order ?? order })
  }
  plugins.sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
}

export function unregisterPlugin(name: string): void {
  plugins = plugins.filter(p => p.name !== name)
}

export function getPlugins(): MarkdownPlugin[] {
  return [...plugins]
}

/** 清空所有已注册插件（主要用于测试场景） */
export function clearPlugins(): void {
  plugins = []
}
