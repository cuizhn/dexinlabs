/**
 * Plugin interface — the extension point of the engine.
 *
 * Per SPEC.md §6: plugins must be independent, must not modify core code,
 * and must not depend on business modules.
 */
import type { TransformedRootAstNode, TransformerContext } from '../ast/types'

export interface Plugin {
  name: string
  version: string
  order?: number
  transform(
    ast: TransformedRootAstNode,
    context?: TransformerContext
  ): Promise<TransformedRootAstNode> | TransformedRootAstNode
}

export interface PluginDefinition {
  name: string
  order: number
  plugin: Plugin
}

export default Plugin
