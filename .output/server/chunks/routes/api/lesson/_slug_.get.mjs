import { c as createSlugHandler } from '../../../_/createSlugHandler.mjs';
import { l as lessonService } from '../../../_/LessonService.mjs';
import '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../../../_/utils.mjs';
import 'drizzle-orm/neon-serverless';
import '@neondatabase/serverless';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';
import '../../../_/index.mjs';
import 'unified';
import 'remark-parse';
import 'remark-rehype';
import 'rehype-stringify';
import 'remark-gfm';
import 'remark-math';
import 'remark-frontmatter';
import 'remark-slug';
import 'rehype-katex';

const _slug__get = createSlugHandler("Lesson", (slug) => lessonService.getLessonPage(slug));

export { _slug__get as default };
//# sourceMappingURL=_slug_.get.mjs.map
