export const TocTransformer = {
  async transform(ast, context = {}) {
    const toc = []
    const walk = (node, depth = 0) => {
      if (!node || typeof node !== 'object') return
      if (node.type === 'heading') {
        toc.push({
          id: node.id,
          depth: node.depth || depth,
          text: node.value || node.content || ''
        })
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(child => walk(child, depth + 1))
      }
    }
    if (Array.isArray(ast?.children)) {
      ast.children.forEach(n => walk(n, 0))
    }
    ast.toc = toc
    return ast
  }
}

export default TocTransformer
