/**
 * Math parser — wraps the markdown parser, flags AST for math processing.
 * Migrated from app/render/parsers/math.js
 */
import type { RootAstNode, ParserOptions } from '../ast/types'
import { parseMarkdown } from './markdown'

export const MathParser = {
  async parse(raw: string, opts: ParserOptions = {}): Promise<RootAstNode> {
    const ast = await parseMarkdown(raw, { ...opts, math: true })
    ast.__mathEnabled = true
    return ast
  }
}

export default MathParser
