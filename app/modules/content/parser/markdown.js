import { parseFrontmatter } from './frontmatter'

export async function parseMarkdown(raw, opts = {}) {
  if (typeof raw !== 'string') {
    return {
      type: 'root',
      children: [],
      frontmatter: raw?.frontmatter || {},
      content: raw?.body || raw?.content || '',
      __passthrough: true
    }
  }

  try {
    const { data, content } = parseFrontmatter(raw)
    return {
      type: 'root',
      children: [{ type: 'text', value: content }],
      frontmatter: data,
      content,
      __parseSource: 'markdown-passthrough',
      __parsedAt: Date.now()
    }
  } catch (e) {
    return {
      type: 'root',
      children: [],
      frontmatter: {},
      content: raw,
      __parseError: e.message,
      __passthrough: true
    }
  }
}

export const MarkdownParser = {
  async parse(raw, opts = {}) {
    return parseMarkdown(raw, opts)
  }
}

export default MarkdownParser
