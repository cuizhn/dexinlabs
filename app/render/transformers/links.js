export const LinksTransformer = {
  async transform(ast, context = {}) {
    const rewrite = (node) => {
      if (!node) return
      if (node.type === 'link' && typeof node.href === 'string') {
        if (node.href.startsWith('/') && !node.href.startsWith('/api')) {
          node.__rewrite = 'internal-route'
        } else if (/^https?:\/\//.test(node.href)) {
          node.target = node.target || '_blank'
          node.rel = node.rel || 'noopener noreferrer'
          node.__rewrite = 'external'
        }
      }
      if (Array.isArray(node.children)) node.children.forEach(rewrite)
    }
    if (Array.isArray(ast?.children)) ast.children.forEach(rewrite)
    ast.__linksProcessed = true
    return ast
  }
}

export default LinksTransformer
