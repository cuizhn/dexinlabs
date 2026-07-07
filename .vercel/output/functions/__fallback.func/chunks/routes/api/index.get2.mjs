import { d as defineEventHandler } from '../../_/nitro.mjs';
import { desc, asc, eq, sql } from 'drizzle-orm';
import { g as getDb, c as courses } from '../../_/db.mjs';
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

class CourseRepository {
  constructor(db2) {
    this.db = db2 || getDb();
    this.table = courses;
  }
  async list({ orderBy = "order", order = "asc" } = {}) {
    const sortDir = order.toLowerCase() === "desc" ? desc : asc;
    const sortCol = orderBy === "id" ? this.table.id : this.table.order;
    return this.db.select().from(this.table).orderBy(sortDir(sortCol));
  }
  async getBySlug(slug) {
    if (!slug) return null;
    const rows = await this.db.select().from(this.table).where(eq(this.table.slug, slug)).limit(1);
    return rows[0] || null;
  }
  async getById(id) {
    if (!id) return null;
    const rows = await this.db.select().from(this.table).where(eq(this.table.id, Number(id))).limit(1);
    return rows[0] || null;
  }
  async getDefault() {
    let row = await this.getBySlug("pep-7a");
    if (!row) {
      const rows = await this.db.select().from(this.table).orderBy(asc(this.table.order), asc(this.table.id)).limit(1);
      row = rows[0] || null;
    }
    return row;
  }
  async count() {
    var _a, _b;
    const rows = await this.db.select({
      count: sql`count(*)`.mapWith(Number)
    }).from(this.table);
    return Number((_b = (_a = rows[0]) == null ? void 0 : _a.count) != null ? _b : 0);
  }
  async create(data) {
    const rows = await this.db.insert(this.table).values(data).returning();
    return rows[0] || null;
  }
  async updateBySlug(slug, data) {
    const patch = { ...data, updatedAt: /* @__PURE__ */ new Date() };
    delete patch.id;
    delete patch.slug;
    delete patch.createdAt;
    const rows = await this.db.update(this.table).set(patch).where(eq(this.table.slug, slug)).returning();
    return rows[0] || null;
  }
  async upsert(data) {
    const { id, createdAt, ...rest } = data || {};
    const payload = { ...rest };
    const onConflictSet = { ...rest };
    delete onConflictSet.slug;
    onConflictSet.updatedAt = /* @__PURE__ */ new Date();
    const rows = await this.db.insert(this.table).values(payload).onConflictDoUpdate({
      target: this.table.slug,
      set: onConflictSet
    }).returning();
    return rows[0] || null;
  }
  async deleteBySlug(slug) {
    return this.db.delete(this.table).where(eq(this.table.slug, slug));
  }
}
const courseRepository = new CourseRepository();

class CourseService {
  constructor({ courses = courseRepository, chapters = chapterRepository, lessons = lessonRepository } = {}) {
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
    const course = await this.courses.getBySlug(slug);
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
  return courseService.getDefault();
});

export { index_get as default };
//# sourceMappingURL=index.get2.mjs.map
