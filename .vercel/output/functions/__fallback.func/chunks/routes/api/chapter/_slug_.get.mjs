import { d as defineEventHandler, a as getRouterParam, c as createError, q as queryCollection } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'better-sqlite3';
import 'node:crypto';

const _slug__get = defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Slug is required"
    });
  }
  const chapter = await queryCollection(event, "chapter").where("slug", "=", slug).first();
  if (!chapter) {
    throw createError({
      statusCode: 404,
      statusMessage: `Chapter not found: ${slug}`
    });
  }
  const lessonSlugs = Array.isArray(chapter.lessons) ? chapter.lessons : [];
  const lessons = lessonSlugs.length ? await queryCollection(event, "lesson").where("slug", "in", lessonSlugs).all() : [];
  const sortedLessons = lessonSlugs.map((s) => lessons.find((l) => l.slug === s)).filter(Boolean);
  let exercise = null;
  try {
    exercise = await queryCollection(event, "exercise").where("slug", "=", slug).first();
  } catch {
    exercise = null;
  }
  return {
    ...chapter,
    lessons: sortedLessons,
    exercise
  };
});

export { _slug__get as default };
//# sourceMappingURL=_slug_.get.mjs.map
