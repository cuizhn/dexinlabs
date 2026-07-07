import { d as defineEventHandler, a as getRouterParam, c as createError } from '../../../_/nitro.mjs';
import { l as lessonRepository, c as chapterRepository } from '../../../_/LessonRepository.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'drizzle-orm';
import '../../../_/db.mjs';
import 'node:process';
import 'drizzle-orm/neon-serverless';
import '@neondatabase/serverless';
import 'drizzle-orm/pg-core';

class LessonService {
  constructor({ lessons = lessonRepository, chapters = chapterRepository } = {}) {
    this.lessons = lessons;
    this.chapters = chapters;
  }
  async listByChapter(chapterSlug) {
    return this.lessons.listByChapter(chapterSlug);
  }
  async getBySlug(slug) {
    const lesson = await this.lessons.getBySlug(slug);
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
  const result = await lessonService.getBySlug(slug);
  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: `Lesson not found: ${slug}`
    });
  }
  return result;
});

export { _slug__get as default };
//# sourceMappingURL=_slug_.get.mjs.map
