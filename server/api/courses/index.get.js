

export default defineEventHandler(async (event) => {

  const courses = await queryCollection(event, 'courses')
    .where('slug', '!=', 'slug')
    .order('order', 'ASC')
    .all()

  return courses
})