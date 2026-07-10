import { c as defineEventHandler, g as getRouterParam, e as createError } from '../../../_/nitro.mjs';
import { c as chapterService } from '../../../_/ChapterService.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../../../_/index.mjs';
import 'drizzle-orm/neon-serverless';
import '@neondatabase/serverless';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';
import '../../../_/LessonRepository.mjs';
import '../../../_/ExerciseRepository.mjs';

const _slug__get = defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Slug is required"
    });
  }
  const result = await chapterService.getBySlug(slug);
  if (!result || !result.chapter) {
    throw createError({
      statusCode: 404,
      statusMessage: `Chapter not found: ${slug}`
    });
  }
  return result;
});

export { _slug__get as default };
//# sourceMappingURL=_slug_.get.mjs.map
