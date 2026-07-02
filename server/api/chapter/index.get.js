import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async event => {
  const query = getQuery(event)

  const course = query.course

  const q = queryCollection(event, 'chapter').order('order', 'ASC')

  if (course) {
    q.where('course', '=', course)
  }

  return await q.all()
})
