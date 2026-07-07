export const SourceContract = {
  name: 'Source',

  description: '唯一职责：获取内容原始数据。不解析、不渲染、不做业务聚合。',

  methods: {
    async findOne(collection, where = {}) {
      throw new Error('[SourceContract.findOne] Must be implemented by a concrete source.')
    },

    async findAll(collection, opts = {}) {
      throw new Error('[SourceContract.findAll] Must be implemented by a concrete source.')
    },

    async count(collection, where = {}) {
      throw new Error('[SourceContract.count] Must be implemented by a concrete source.')
    }
  },

  supportedCollections: ['course', 'chapter', 'lesson', 'exercise', 'asset']
}

export function assertSourceContract(source) {
  const required = ['findOne', 'findAll', 'count']
  for (const method of required) {
    if (typeof source[method] !== 'function') {
      throw new Error(`[SourceContract] Missing method: ${method}`)
    }
  }
}
