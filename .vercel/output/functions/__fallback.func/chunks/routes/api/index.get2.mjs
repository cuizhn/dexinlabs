import { d as defineEventHandler } from '../../_/nitro.mjs';
import { desc, asc, eq, sql } from 'drizzle-orm';
import { a as courses, g as getDb } from '../../_/db.mjs';
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
  constructor(db2) {
    __publicField$1(this, "_explicitDb");
    __publicField$1(this, "table");
    this._explicitDb = db2 || null;
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
  constructor({ courses: courses2 = courseRepository, chapters: chapters2 = chapterRepository, lessons: lessons2 = lessonRepository } = {}) {
    __publicField(this, "courses");
    __publicField(this, "chapters");
    __publicField(this, "lessons");
    this.courses = courses2;
    this.chapters = chapters2;
    this.lessons = lessons2;
  }
  async list() {
    return this.courses.list();
  }
  async getDefault() {
    const course = await this.courses.getDefault();
    if (!course) return null;
    const chapters2 = await this.chapters.listByCourse(course.slug);
    const chaptersAggregated = [];
    for (const chapter of chapters2) {
      const lessons2 = await this.lessons.listByChapter(chapter.slug);
      chaptersAggregated.push({ ...chapter, lessons: lessons2 });
    }
    return { ...course, chapters: chaptersAggregated };
  }
  async getBySlug(slug) {
    const course = await this.courses.getBySlug(slug);
    if (!course) return null;
    const chapters2 = await this.chapters.listByCourse(course.slug);
    const chaptersAggregated = [];
    for (const chapter of chapters2) {
      const lessons2 = await this.lessons.listByChapter(chapter.slug);
      chaptersAggregated.push({ ...chapter, lessons: lessons2 });
    }
    return { ...course, chapters: chaptersAggregated };
  }
}
const courseService = new CourseService();

const index_get = defineEventHandler(async () => {
  return courseService.getDefault();
});

export { index_get as default };
//# sourceMappingURL=index.get2.mjs.map
