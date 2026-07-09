import { chapterService } from './index-D14U1YfW.mjs';
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

async function loadChapter(slug, opts = {}) {
  if (!slug) return { chapter: null, exercise: null, lessons: [], __loadedBy: "content-loader/chapter" };
  const result = await chapterService.getBySlug(slug);
  if (!result || !result.chapter) {
    return { chapter: null, exercise: null, lessons: [], __loadedBy: "content-loader/chapter" };
  }
  return {
    chapter: result.chapter,
    exercise: result.exercise,
    lessons: result.lessons,
    __loadedBy: "content-loader/chapter"
  };
}
async function listChapters(courseSlug = null) {
  return chapterService.list(courseSlug ?? void 0);
}

export { listChapters, loadChapter };
//# sourceMappingURL=chapter-B4T1dsyd.mjs.map
