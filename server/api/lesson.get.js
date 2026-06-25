export default defineEventHandler(async (event) => {
  const lessons = await queryCollection(event, 'lesson')
    .where('slug', '=', 'quadratic-equation-in-one-unknown-solve')
  
    .all()

  return lessons
})