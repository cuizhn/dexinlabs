import { queryCollection } from '@nuxt/content'

export default defineEventHandler(async (event) => {

  const courses = await queryCollection(event, 'courses')
    .order('order', 'ASC')
    .all()

  return courses
})