import { courseService } from './index-6i3vDWZz.mjs';
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

async function loadCourse(slug = null, opts = {}) {
  const { source } = opts;
  const course = slug ? await courseService.getBySlug(slug) : await courseService.getDefault();
  if (!course) return null;
  const lessonsMap = {};
  const chapters = course.chapters || [];
  for (const ch of chapters) {
    lessonsMap[ch.slug] = ch.lessons || [];
  }
  return {
    ...course,
    chapters,
    lessonsMap,
    __loadedBy: "content-loader/course",
    __source: source?.name || null
  };
}

export { loadCourse };
//# sourceMappingURL=course-C8kblM_0.mjs.map
