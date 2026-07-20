import { c as defineEventHandler, g as getQuery } from '../../_/nitro.mjs';
import { c as chapterService } from '../../_/ChapterService.mjs';
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
import '../../_/index.mjs';
import 'unified';
import 'remark-parse';
import 'remark-rehype';
import 'rehype-stringify';
import 'remark-gfm';
import 'remark-math';
import 'remark-frontmatter';
import 'remark-slug';
import 'rehype-katex';

const index_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const courseSlug = query.course && typeof query.course === "string" ? query.course : void 0;
  return chapterService.list(courseSlug);
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
