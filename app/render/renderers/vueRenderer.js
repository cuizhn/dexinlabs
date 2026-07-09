import { getEngine } from '@me'

/**
 * Vue Renderer adapter — bridges the engine's framework-agnostic output
 * to the app's @core/registry contract.
 *
 * The engine owns the actual rendering (HTML/VNode). This adapter exists
 * so engine.renderer('vue') from the Engine facade remains functional.
 */
export const VueRenderer = {
  name: 'vue-renderer',

  async renderToVNode(ast, context = {}) {
    const engine = getEngine()
    const result = await engine.run(ast, {
      renderTarget: 'vnode',
      rendererContext: context
    })
    return result.rendered || null
  },

  async renderToHTML(ast, context = {}) {
    const engine = getEngine()
    const result = await engine.run(ast, {
      renderTarget: 'html',
      rendererContext: context
    })
    return result.rendered || ''
  }
}

export default VueRenderer
