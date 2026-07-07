import { SourceContract } from '@modules/content/contracts/Source'

export class CMSSource {
  constructor(api = {}) {
    this.api = api
    this.name = 'cms'
  }

  async findOne(collection, where = {}) {
    throw new Error(
      '[CMSSource] findOne not implemented — placeholder for Strapi / Payload / Sanity / headless CMS adapter.\n' +
      'Expects: this.api.fetch(`/api/${collection}/${slug}`) -> Promise<Doc | null>'
    )
  }

  async findAll(collection, opts = {}) {
    throw new Error(
      '[CMSSource] findAll not implemented — placeholder for future CMS REST/GraphQL integration.'
    )
  }

  async count(collection, where = {}) {
    throw new Error('[CMSSource] count not implemented.')
  }

  static get contract() {
    return SourceContract
  }
}

export default CMSSource
