import { d as defineEventHandler, a as getQuery, c as createError } from '../../_/nitro.mjs';
import { c as chapterService } from '../../_/ChapterService.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '../../_/index.mjs';
import 'node:process';
import 'drizzle-orm/neon-serverless';
import '@neondatabase/serverless';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';
import '../../_/LessonRepository.mjs';
import '../../_/ExerciseRepository.mjs';

const index_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const courseSlug = query.course && typeof query.course === "string" ? query.course : null;
  try {
    return await chapterService.list(courseSlug);
  } catch (e) {
    if (e && e.code === "DATABASE_URL_MISSING") {
      throw createError({
        statusCode: 503,
        statusMessage: "DATABASE_URL is not configured",
        data: { message: e.message, code: e.code, hint: "Vercel: Project \u2192 Settings \u2192 Environment Variables \u2192 Add DATABASE_URL" }
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to list chapters",
      data: { message: (e == null ? void 0 : e.message) || String(e) }
    });
  }
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
