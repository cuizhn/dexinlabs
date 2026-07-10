import { d as defineEventHandler, g as getRouterParam, c as createError } from '../../../_/nitro.mjs';
import { q as queries } from '../../../_/index.mjs';
import { l as lessonRepository, c as chapterRepository } from '../../../_/LessonRepository.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:process';
import 'drizzle-orm/neon-serverless';
import '@neondatabase/serverless';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class LessonService {
  constructor({ lessons = lessonRepository, chapters = chapterRepository } = {}) {
    __publicField(this, "lessons");
    __publicField(this, "chapters");
    this.lessons = lessons;
    this.chapters = chapters;
  }
  async listByChapter(chapterSlug) {
    const q = queries.normalizeByChapter(chapterSlug);
    if (!q.isValid) return [];
    return this.lessons.listByChapter(q.chapterSlug || String(chapterSlug));
  }
  async getBySlug(slug) {
    const q = queries.normalizeBySlug(slug);
    if (!q.isValid) return null;
    const lesson = await this.lessons.getBySlug(q.slug);
    if (!lesson) return null;
    let chapter = null;
    if (lesson.chapterId) {
      chapter = await this.chapters.getById(lesson.chapterId) || null;
    }
    if (!chapter && lesson.chapter) {
      chapter = await this.chapters.getBySlug(lesson.chapter) || null;
    }
    return { ...lesson, chapter };
  }
}
const lessonService = new LessonService();

const _slug__get = defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Slug is required"
    });
  }
  try {
    const result = await lessonService.getBySlug(slug);
    if (!result) {
      throw createError({
        statusCode: 404,
        statusMessage: `Lesson not found: ${slug}`
      });
    }
    return result;
  } catch (e) {
    if (e && e.statusCode) throw e;
    if (e && e.code === "DATABASE_URL_MISSING") {
      throw createError({
        statusCode: 503,
        statusMessage: "DATABASE_URL is not configured",
        data: { message: e.message, code: e.code, hint: "Vercel: Project \u2192 Settings \u2192 Environment Variables \u2192 Add DATABASE_URL" }
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to load lesson",
      data: { message: (e == null ? void 0 : e.message) || String(e) }
    });
  }
});

export { _slug__get as default };
//# sourceMappingURL=_slug_.get.mjs.map
