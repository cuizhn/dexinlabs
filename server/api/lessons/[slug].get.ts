export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Slug is required",
    });
  }

  return queryCollection(event, "lesson")
    .where("slug", "=", slug)
    .first();
});