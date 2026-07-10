import { c as defineEventHandler, g as getRouterParam, e as createError } from '../../../_/nitro.mjs';
import { q as queries } from '../../../_/index.mjs';
import { e as exerciseRepository } from '../../../_/ExerciseRepository.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'drizzle-orm/neon-serverless';
import '@neondatabase/serverless';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, key + "" , value);
class ExerciseService {
  constructor({ exercises = exerciseRepository } = {}) {
    __publicField(this, "exercises");
    this.exercises = exercises;
  }
  async listByChapter(chapterSlug) {
    const q = queries.normalizeByChapter(chapterSlug);
    if (!q.isValid) return [];
    return this.exercises.listByChapter(q.chapterSlug || String(chapterSlug));
  }
  async getBySlug(slug) {
    const q = queries.normalizeBySlug(slug);
    if (!q.isValid) return null;
    return this.exercises.getBySlug(q.slug);
  }
}
const exerciseService = new ExerciseService();

const _slug__get = defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Slug is required"
    });
  }
  const exercise = await exerciseService.getBySlug(slug);
  if (!exercise) {
    throw createError({
      statusCode: 404,
      statusMessage: `Exercise not found: ${slug}`
    });
  }
  return exercise;
});

export { _slug__get as default };
//# sourceMappingURL=_slug_.get.mjs.map
