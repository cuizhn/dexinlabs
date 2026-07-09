/**
 * Internal plugin registry — the engine's own IoC, no dependency on @core/registry.
 */
import type { Plugin, PluginDefinition } from './types'
import type { TransformedRootAstNode, TransformerContext } from '../ast/types'

const registry = new Map<string, PluginDefinition>()

export function registerPlugin(plugin: Plugin, order: number = 100): void {
  if (!plugin || typeof plugin.name !== 'string' || typeof plugin.transform !== 'function') {
    throw new Error('[PluginRegistry] Invalid plugin: must have { name, transform }')
  }
  registry.set(plugin.name, { name: plugin.name, order, plugin })
}

export function unregisterPlugin(name: string): void {
  registry.delete(name)
}

export function getPlugin(name: string): PluginDefinition | undefined {
  return registry.get(name)
}

export function getPlugins(): PluginDefinition[] {
  return Array.from(registry.values()).sort((a, b) => a.order - b.order)
}

export function clearPlugins(): void {
  registry.clear()
}

export async function runPlugins(
  ast: TransformedRootAstNode,
  context: TransformerContext = {}
): Promise<TransformedRootAstNode> {
  let current = ast
  for (const def of getPlugins()) {
    try {
      current = await def.plugin.transform(current, context)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.warn(`[PluginRegistry] Plugin "${def.name}" failed: ${msg}`)
    }
  }
  return current
}

export default { registerPlugin, unregisterPlugin, getPlugin, getPlugins, clearPlugins, runPlugins }
