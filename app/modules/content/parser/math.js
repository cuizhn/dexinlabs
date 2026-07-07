import MarkdownParser from './markdown'

export const MathParser = {
  async parse(raw, opts = {}) {
    const ast = await MarkdownParser.parse(raw, opts)
    ast.__mathEnabled = true
    return ast
  }
}

export default MathParser
