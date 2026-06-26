export default defineEventHandler(async (event) => {
  const lessons = await queryCollection(event, 'chapters')
    .where('slug', '=', 'quadratic-equation-in-one-unknown')
  
    .all()

  return lessons
})