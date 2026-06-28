import { defineEventHandler, getQuery } from 'h3'
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const course = query.course as string | undefined

  const q = queryCollection(event, 'chapter').order('order', 'ASC')

  

  return await q.all()
})
