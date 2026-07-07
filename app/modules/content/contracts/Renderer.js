export const RendererContract = {
  name: 'Renderer',

  description: '只做渲染：AST → Vue 组件树 / HTML 字符串。不解析 Markdown，不查询数据库。',

  methods: {
    async renderToVNode(ast, context = {}) {
      throw new Error('[RendererContract.renderToVNode] Not implemented.')
    },

    async renderToHTML(ast, context = {}) {
      throw new Error('[RendererContract.renderToHTML] Not implemented.')
    }
  }
}

export function assertRendererContract(renderer) {
  if (typeof renderer.renderToVNode !== 'function' && typeof renderer.renderToHTML !== 'function') {
    throw new Error('[RendererContract] At least one of renderToVNode / renderToHTML must be implemented.')
  }
}
