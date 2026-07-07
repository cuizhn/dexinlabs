export const LoaderContract = {
  name: 'Loader',

  description: '从 Source 拉取数据后，负责组装业务对象（Course → Chapter → Lesson 树形结构、关联对象等）。Source 不做聚合，Loader 做。',

  methods: {
    async loadCourse(slug, opts) { throw new Error('[LoaderContract.loadCourse] Not implemented.') },
    async loadChapter(slug, opts) { throw new Error('[LoaderContract.loadChapter] Not implemented.') },
    async loadLesson(slug, opts) { throw new Error('[LoaderContract.loadLesson] Not implemented.') },
    async loadAsset(slug, opts) { throw new Error('[LoaderContract.loadAsset] Not implemented.') },
    async listChapters(opts) { throw new Error('[LoaderContract.listChapters] Not implemented.') }
  }
}

export function assertLoaderContract(loader) {
  const required = ['loadCourse', 'loadChapter', 'loadLesson', 'loadAsset', 'listChapters']
  for (const method of required) {
    if (typeof loader[method] !== 'function') {
      throw new Error(`[LoaderContract] Missing method: ${method}`)
    }
  }
}
