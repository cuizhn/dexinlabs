import { queryCollection } from '@nuxt/content/server'

export const courseRepository = {

  async findAll(event) {

    return await queryCollection(
      event,
      'courses'
    )
      .order('order', 'ASC')
      .all()
  }

}