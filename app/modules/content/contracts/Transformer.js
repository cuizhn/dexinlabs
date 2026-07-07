export const TransformerContract = {
  name: 'Transformer',

  description: 'AST 变换层。所有增强（TOC、Heading ID、Link 改写、Excerpt、Reading Time、Reference、Math 后处理）都在这里。Parser 输出纯净 AST，Transformer 负责增值。',

  methods: {
    async transform(ast, context = {}) {
      throw new Error('[TransformerContract.transform] Not implemented. Expected: AST -> enhanced AST.')
    }
  }
}

export function assertTransformerContract(transformer) {
  if (typeof transformer.transform !== 'function') {
    throw new Error('[TransformerContract] Missing required method: transform(ast, context)')
  }
}
