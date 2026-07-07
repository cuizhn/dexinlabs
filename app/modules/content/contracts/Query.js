export const QueryContract = {
  name: 'Query',

  description: '给业务层 / Page 调用的统一门面。负责缓存、权限、多 Loader 聚合等逻辑。不碰 Source，永远走 Engine。',

  methods: {
    async getCourse(slug, opts) { throw new Error('[QueryContract.getCourse] Not implemented.') },
    async getChapter(slug, opts) { throw new Error('[QueryContract.getChapter] Not implemented.') },
    async getLesson(slug, opts) { throw new Error('[QueryContract.getLesson] Not implemented.') },
    async getExercise(slug, opts) { throw new Error('[QueryContract.getExercise] Not implemented.') },
    async listChapters(opts) { throw new Error('[QueryContract.listChapters] Not implemented.') }
  }
}

export function assertQueryContract(query) {
  const required = ['getCourse', 'getChapter', 'getLesson', 'getExercise', 'listChapters']
  for (const method of required) {
    if (typeof query[method] !== 'function') {
      throw new Error(`[QueryContract] Missing method: ${method}`)
    }
  }
}
