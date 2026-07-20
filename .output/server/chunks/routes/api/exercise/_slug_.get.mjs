import { c as createSlugHandler } from '../../../_/createSlugHandler.mjs';
import { e as exerciseService } from '../../../_/ExerciseService.mjs';
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

const _slug__get = createSlugHandler("Exercise", (slug) => exerciseService.getBySlug(slug));

export { _slug__get as default };
//# sourceMappingURL=_slug_.get.mjs.map
