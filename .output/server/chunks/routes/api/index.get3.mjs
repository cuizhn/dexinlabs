import { c as defineEventHandler, e as createError, g as getQuery } from '../../_/nitro.mjs';
import { e as exerciseService } from '../../_/ExerciseService.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../../_/utils.mjs';
import 'drizzle-orm/neon-serverless';
import '@neondatabase/serverless';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';

const index_get = defineEventHandler(async (event) => {
  if (!process.env.DATABASE_URL) {
    throw createError({
      statusCode: 503,
      statusMessage: "DATABASE_URL is not configured."
    });
  }
  const query = getQuery(event);
  const chapter = typeof query.chapter === "string" ? query.chapter : void 0;
  if (chapter) {
    return exerciseService.listByChapter(chapter);
  }
  return exerciseService.listAll();
});

export { index_get as default };
//# sourceMappingURL=index.get3.mjs.map
