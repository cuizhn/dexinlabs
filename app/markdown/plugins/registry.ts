import type { MarkdownPlugin } from '../types'

let plugins: MarkdownPlugin[] = []

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

export function clearPlugins(): void {
  plugins = []
}
