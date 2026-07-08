export const ExcerptTransformer = {
  async transform(ast, context = {}) {
    const content = typeof ast?.content === 'string' ? ast.content : ''
    const plain = content.replace(/[#*`>\[\]\n]+/g, ' ').replace(/\s+/g, ' ').trim()
    const excerptLimit = context.excerptLimit || 140
    ast.excerpt = plain.length > excerptLimit ? plain.slice(0, excerptLimit) + '…' : plain
    return ast
  }
}

export default ExcerptTransformer
