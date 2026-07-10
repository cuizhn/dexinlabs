import { d as defineEventHandler, g as getRouterParam, c as createError } from '../../../_/nitro.mjs';
import { c as chapterService } from '../../../_/ChapterService.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '../../../_/index.mjs';
import 'node:process';
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
  ff;
  try {
    const result = await chapterService.getBySlug(slug);
    if (!result || !result.chapter) {
      throw createError({
        statusCode: 404,
        statusMessage: `Chapter not found: ${slug}`
      });
    }
    return result;
  } catch (e) {
    if (e && e.statusCode) throw e;
    if (e && e.code === "DATABASE_URL_MISSING") {
      throw createError({
        statusCode: 503,
        statusMessage: "DATABASE_URL is not configured",
        data: { message: e.message, code: e.code, hint: "Vercel: Project \u2192 Settings \u2192 Environment Variables \u2192 Add DATABASE_URL" }
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to load chapter",
      data: { message: (e == null ? void 0 : e.message) || String(e) }
    });
  }
});

export { _slug__get as default };
//# sourceMappingURL=_slug_.get.mjs.map
