export default defineEventHandler(async (event) => {
  const lessons = await queryCollection(event, 'courses')
    .where('slug', '=', 'equation')
  
    .all()

  return lessons
})