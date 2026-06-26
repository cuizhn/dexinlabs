export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");

  return await queryCollection(event, "lesson")
    .where("slug", "=", slug)
    .first();
});