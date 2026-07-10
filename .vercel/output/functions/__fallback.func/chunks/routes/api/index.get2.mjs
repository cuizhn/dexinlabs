import { d as defineEventHandler, c as createError } from '../../_/nitro.mjs';
import { a as courses, g as getDb, q as queries } from '../../_/index.mjs';
import { desc, asc, eq, sql } from 'drizzle-orm';
import { c as chapterRepository, l as lessonRepository } from '../../_/LessonRepository.mjs';
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

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
class CourseRepository {
  constructor(db) {
    __publicField$1(this, "_explicitDb");
    __publicField$1(this, "table");
    this._explicitDb = db || null;
    this.table = courses;
  }
  _getDb() {
    return this._explicitDb || getDb();
  }
  async list({ orderBy = "order", order = "asc" } = {}) {
    const sortDir = order.toLowerCase() === "desc" ? desc : asc;
    const sortCol = orderBy === "id" ? this.table.id : this.table.order;
    return this._getDb().select().from(this.table).orderBy(sortDir(sortCol));
  }
  async getBySlug(slug) {
    if (!slug) return null;
    const rows = await this._getDb().select().from(this.table).where(eq(this.table.slug, slug)).limit(1);
    return rows[0] || null;
  }
  async getById(id) {
    if (!id) return null;
    const rows = await this._getDb().select().from(this.table).where(eq(this.table.id, Number(id))).limit(1);
    return rows[0] || null;
  }
  async getDefault() {
    let row = await this.getBySlug("pep-7a");
    if (!row) {
      const rows = await this._getDb().select().from(this.table).orderBy(asc(this.table.order), asc(this.table.id)).limit(1);
      row = rows[0] || null;
    }
    return row;
  }
  async count() {
    var _a, _b;
    const rows = await this._getDb().select({
      count: sql`count(*)`.mapWith(Number)
    }).from(this.table);
    return Number((_b = (_a = rows[0]) == null ? void 0 : _a.count) != null ? _b : 0);
  }
  async create(data) {
    const rows = await this._getDb().insert(this.table).values(data).returning();
    return rows[0] || null;
  }
  async updateBySlug(slug, data) {
    const patch = { ...data, updatedAt: /* @__PURE__ */ new Date() };
    delete patch.id;
    delete patch.slug;
    delete patch.createdAt;
    const rows = await this._getDb().update(this.table).set(patch).where(eq(this.table.slug, slug)).returning();
    return rows[0] || null;
  }
  async upsert(data) {
    const { id, createdAt, ...rest } = data || {};
    const payload = { ...rest };
    const onConflictSet = { ...rest };
    delete onConflictSet.slug;
    onConflictSet.updatedAt = /* @__PURE__ */ new Date();
    const rows = await this._getDb().insert(this.table).values(payload).onConflictDoUpdate({
      target: this.table.slug,
      set: onConflictSet
    }).returning();
    return rows[0] || null;
  }
  async deleteBySlug(slug) {
    return this._getDb().delete(this.table).where(eq(this.table.slug, slug));
  }
}
const courseRepository = new CourseRepository();

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class CourseService {
  constructor({ courses = courseRepository, chapters = chapterRepository, lessons = lessonRepository } = {}) {
    __publicField(this, "courses");
    __publicField(this, "chapters");
    __publicField(this, "lessons");
    this.courses = courses;
    this.chapters = chapters;
    this.lessons = lessons;
  }
  async list() {
    return this.courses.list();
  }
  async getDefault() {
    const course = await this.courses.getDefault();
    if (!course) return null;
    const chapters = await this.chapters.listByCourse(course.slug);
    const chaptersAggregated = [];
    for (const chapter of chapters) {
      const lessons = await this.lessons.listByChapter(chapter.slug);
      chaptersAggregated.push({ ...chapter, lessons });
    }
    return { ...course, chapters: chaptersAggregated };
  }
  async getBySlug(slug) {
    const q = queries.normalizeBySlug(slug);
    if (!q.isValid) return null;
    const course = await this.courses.getBySlug(q.slug);
    if (!course) return null;
    const chapters = await this.chapters.listByCourse(course.slug);
    const chaptersAggregated = [];
    for (const chapter of chapters) {
      const lessons = await this.lessons.listByChapter(chapter.slug);
      chaptersAggregated.push({ ...chapter, lessons });
    }
    return { ...course, chapters: chaptersAggregated };
  }
}
const courseService = new CourseService();

const index_get = defineEventHandler(async () => {
  try {
    return await courseService.getDefault();
  } catch (e) {
    if (e && e.code === "DATABASE_URL_MISSING") {
      throw createError({
        statusCode: 503,
        statusMessage: "DATABASE_URL is not configured",
        data: { message: e.message, code: e.code, hint: "Vercel: Project \u2192 Settings \u2192 Environment Variables \u2192 Add DATABASE_URL" }
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to load course",
      data: { message: (e == null ? void 0 : e.message) || String(e) }
    });
  }
});

export { index_get as default };
//# sourceMappingURL=index.get2.mjs.map
