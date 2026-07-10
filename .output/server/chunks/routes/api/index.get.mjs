import { c as defineEventHandler, f as getQuery } from '../../_/nitro.mjs';
import { c as chapterService } from '../../_/ChapterService.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../../_/index.mjs';
import 'drizzle-orm/neon-serverless';
import '@neondatabase/serverless';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';
import '../../_/LessonRepository.mjs';
import '../../_/ExerciseRepository.mjs';

const index_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const courseSlug = query.course && typeof query.course === "string" ? query.course : null;
  return chapterService.list(courseSlug);
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
