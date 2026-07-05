import { defineEventHandler} from 'h3'

export default defineEventHandler(async event => {


  const q = queryCollection(event, 'course').order('order', 'ASC')

  .where('slug', '=', 'pep-7a')
  .first()


  return await q
})