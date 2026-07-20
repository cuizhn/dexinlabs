import { c as defineEventHandler, f as getRouterParam, e as createError } from './nitro.mjs';

function createSlugHandler(entityName, fetcher) {
  return defineEventHandler(async (event) => {
    const slug = getRouterParam(event, "slug");
    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: "Slug is required"
      });
    }
    const result = await fetcher(slug);
    if (!result) {
      throw createError({
        statusCode: 404,
        statusMessage: `${entityName} not found: ${slug}`
      });
    }
    return result;
  });
}

export { createSlugHandler as c };
//# sourceMappingURL=createSlugHandler.mjs.map
