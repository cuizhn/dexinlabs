export type AstNodeType =
  | 'root'
  | 'heading'
  | 'paragraph'
  | 'text'
  | 'link'
  | 'image'
  | 'list'
  | 'listItem'
  | 'code'
  | 'blockquote'
  | 'math'
  | 'table'
  | 'tableRow'
  | 'tableCell'
  | 'emphasis'
  | 'strong'
  | 'inlineCode'
  | 'thematicBreak'
  | 'html'
  | string

export interface AstNode {
  type: AstNodeType
  children?: AstNode[]
  value?: string
  [key: string]: unknown
}

export interface RootAstNode extends AstNode {
  type: 'root'
  children: AstNode[]
  frontmatter: Record<string, unknown>
  content: string
}

export interface ParserOptions {
  parseFrontmatter?: boolean
  allowDangerousHtml?: boolean
  [key: string]: unknown
}

export interface ParserOutputShape {
  type: 'root'
  children: AstNode[]
  frontmatter: Record<string, unknown>
  content: string
}

export interface ParserContractMethods {
  parse<TOptions extends ParserOptions = ParserOptions>(
    raw: string,
    opts?: TOptions
  ): Promise<RootAstNode>
}

export interface ParserContractDefinition {
  name: string
  description: string
  methods: ParserContractMethods
  outputShape: ParserOutputShape
}

export const ParserContract: ParserContractDefinition = {
  name: 'Parser',

  description: '只做解析：原始 Markdown / 文本 → AST。不做 TOC、不做 Math 渲染、不做 Heading ID 注入、不碰 Vue。',

  methods: {
    async parse<TOptions extends ParserOptions = ParserOptions>(
      raw: string,
      opts: TOptions = {} as TOptions
    ): Promise<RootAstNode> {
      throw new Error('[ParserContract.parse] Not implemented. Expected: raw markdown string -> AST object.')
    }
  },

  outputShape: {
    type: 'root',
    children: [],
    frontmatter: {},
    content: ''
  }
}

export type ParserContract = ParserContractMethods

export function assertContract<T>(obj: unknown): asserts obj is T {
  if (obj === null || obj === undefined) {
    throw new Error('[assertContract] Object is null or undefined')
  }
}

export function assertParserContract(parser: unknown): asserts parser is ParserContractMethods {
  assertContract<ParserContractMethods>(parser)
  if (typeof (parser as unknown as Record<string, unknown>).parse !== 'function') {
    throw new Error('[ParserContract] Missing required method: parse(raw, opts)')
  }
}
