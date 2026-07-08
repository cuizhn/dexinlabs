export function slugifyHeading(text = '') {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9_\-\u4e00-\u9fa5]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const HeadingTransformer = {
  async transform(ast, context = {}) {
    if (!ast || ast.__headingInjected) return ast
    let idCounter = 0
    const inject = (node) => {
      if (!node || typeof node !== 'object') return
      if (node.type === 'heading' && !node.id) {
        node.id = slugifyHeading(node.value || node.content || `h-${idCounter++}`)
      }
      if (Array.isArray(node.children)) node.children.forEach(inject)
    }
    if (Array.isArray(ast.children)) ast.children.forEach(inject)
    ast.__headingInjected = true
    return ast
  }
}

export default HeadingTransformer
