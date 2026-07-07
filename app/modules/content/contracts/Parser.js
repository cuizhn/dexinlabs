export const ParserContract = {
  name: 'Parser',

  description: '只做解析：原始 Markdown / 文本 → AST。不做 TOC、不做 Math 渲染、不做 Heading ID 注入、不碰 Vue。',

  methods: {
    async parse(raw, opts = {}) {
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

export function assertParserContract(parser) {
  if (typeof parser.parse !== 'function') {
    throw new Error('[ParserContract] Missing required method: parse(raw, opts)')
  }
}
