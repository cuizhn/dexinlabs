import MarkdownRenderer from '../theme/MarkdownRenderer.vue'

export const VueRenderer = {
  name: 'vue-renderer',

  async renderToVNode(ast, context = {}) {
    return {
      __vnodeReady: true,
      ast,
      context,
      component: MarkdownRenderer,
      props: buildRendererProps(ast, context)
    }
  },

  async renderToHTML(ast, context = {}) {
    const content = typeof ast?.content === 'string' ? ast.content : ast?.raw || ''
    return escapeHtml(content)
  }
}

function buildRendererProps(ast, context) {
  const frontmatter = ast?.frontmatter || {}
  const body = typeof ast?.content === 'string' ? ast.content : ''
  const documentLike = {
    body,
    ...frontmatter,
    _toc: ast?.toc || [],
    _excerpt: ast?.excerpt || '',
    _readingTime: ast?.readingTime || null,
    _md: {
      ast,
      theme: context.theme || 'default',
      highlight: context.highlight !== false
    }
  }
  return {
    value: documentLike,
    document: documentLike,
    theme: context.theme || 'default',
    ast
  }
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export default VueRenderer
