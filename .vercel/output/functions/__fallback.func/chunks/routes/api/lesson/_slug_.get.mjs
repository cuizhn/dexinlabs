import { d as defineEventHandler, a as getRouterParam, c as createError, q as queryCollection } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'better-sqlite3';
import 'node:crypto';

const _slug__get = defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Slug is required"
    });
  }
  const lesson = await queryCollection(event, "lesson").where("slug", "=", slug).first();
  if (!lesson) {
    throw createError({
      statusCode: 404,
      statusMessage: `Lesson not found: ${slug}`
    });
  }
  return lesson;
});

export { _slug__get as default };
//# sourceMappingURL=_slug_.get.mjs.map
