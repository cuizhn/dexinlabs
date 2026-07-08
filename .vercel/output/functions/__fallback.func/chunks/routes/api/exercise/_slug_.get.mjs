import { d as defineEventHandler, g as getRouterParam, c as createError } from '../../../_/nitro.mjs';
import { e as exerciseRepository } from '../../../_/ExerciseRepository.mjs';
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

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, key + "" , value);
class ExerciseService {
  constructor({ exercises: exercises2 = exerciseRepository } = {}) {
    __publicField(this, "exercises");
    this.exercises = exercises2;
  }
  async listByChapter(chapterSlug) {
    return this.exercises.listByChapter(chapterSlug);
  }
  async getBySlug(slug) {
    return this.exercises.getBySlug(slug);
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
