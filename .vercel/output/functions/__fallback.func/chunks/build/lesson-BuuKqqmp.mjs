import { lessonService } from './index-D14U1YfW.mjs';
import 'drizzle-orm';
import './server.mjs';
import 'vue';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import 'node:process';
import 'drizzle-orm/neon-serverless';
import '@neondatabase/serverless';
import 'drizzle-orm/pg-core';
import 'marked';
import '@vue/shared';

async function loadLesson(slug, opts = {}) {
  if (!slug) return null;
  const result = await lessonService.getBySlug(slug);
  if (!result) return null;
  return {
    ...result,
    __loadedBy: "content-loader/lesson"
  };
}

export { loadLesson };
//# sourceMappingURL=lesson-BuuKqqmp.mjs.map
