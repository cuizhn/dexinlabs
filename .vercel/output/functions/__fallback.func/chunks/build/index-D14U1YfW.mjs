import { eq, and, desc, asc, or, sql } from 'drizzle-orm';
import { k as chapters, j as getDb, i as courses, l as lessons, m as exercises } from './server.mjs';
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

class CourseRepository {
  _explicitDb;
  table;
  constructor(db) {
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
    const rows = await this._getDb().select({
      count: sql`count(*)`.mapWith(Number)
    }).from(this.table);
    return Number(rows[0]?.count ?? 0);
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
class ChapterRepository {
  _explicitDb;
  table;
  constructor(db) {
    this._explicitDb = db || null;
    this.table = chapters;
  }
  _getDb() {
    return this._explicitDb || getDb();
  }
  _buildWhere({ course, courseId, slug } = {}) {
    const clauses = [];
    if (slug) clauses.push(eq(this.table.slug, slug));
    if (courseId) clauses.push(eq(this.table.courseId, Number(courseId)));
    if (course) clauses.push(eq(this.table.course, course));
    return clauses.length ? and(...clauses) : void 0;
  }
  async list({ course, courseId, orderBy = "order", order = "asc" } = {}) {
    const sortDir = order.toLowerCase() === "desc" ? desc : asc;
    const sortCol = orderBy === "id" ? this.table.id : this.table.order;
    const where = this._buildWhere({ course, courseId });
    let query = this._getDb().select().from(this.table);
    if (where) query = query.where(where);
    return query.orderBy(sortDir(sortCol));
  }
  async listByCourse(courseSlug) {
    if (!courseSlug) return [];
    const rows = await this._getDb().select({
      id: this.table.id,
      slug: this.table.slug,
      title: this.table.title,
      summary: this.table.summary,
      order: this.table.order,
      course: this.table.course,
      cover: this.table.cover,
      body: this.table.body,
      courseId: this.table.courseId,
      createdAt: this.table.createdAt,
      updatedAt: this.table.updatedAt
    }).from(this.table).leftJoin(courses, eq(this.table.courseId, courses.id)).where(
      or(
        eq(this.table.course, courseSlug),
        eq(courses.slug, courseSlug)
      )
    ).orderBy(asc(this.table.order), asc(this.table.id));
    return rows;
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
  async count(filters = {}) {
    const where = this._buildWhere(filters);
    let query = this._getDb().select({ count: sql`count(*)`.mapWith(Number) }).from(this.table);
    if (where) query = query.where(where);
    const rows = await query;
    return Number(rows[0]?.count ?? 0);
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
const chapterRepository = new ChapterRepository();
class LessonRepository {
  _explicitDb;
  table;
  constructor(db) {
    this._explicitDb = db || null;
    this.table = lessons;
  }
  _getDb() {
    return this._explicitDb || getDb();
  }
  _buildWhere({ chapter, chapterId, slug } = {}) {
    const clauses = [];
    if (slug) clauses.push(eq(this.table.slug, slug));
    if (chapterId) clauses.push(eq(this.table.chapterId, Number(chapterId)));
    if (chapter) clauses.push(eq(this.table.chapter, chapter));
    return clauses.length ? and(...clauses) : void 0;
  }
  async list({ chapter, chapterId, orderBy = "order", order = "asc" } = {}) {
    const sortDir = order.toLowerCase() === "desc" ? desc : asc;
    const sortCol = orderBy === "id" ? this.table.id : this.table.order;
    const where = this._buildWhere({ chapter, chapterId });
    let query = this._getDb().select().from(this.table);
    if (where) query = query.where(where);
    return query.orderBy(sortDir(sortCol));
  }
  async listByChapter(chapterSlug) {
    if (!chapterSlug) return [];
    const rows = await this._getDb().select({
      id: this.table.id,
      slug: this.table.slug,
      title: this.table.title,
      summary: this.table.summary,
      order: this.table.order,
      chapter: this.table.chapter,
      objectives: this.table.objectives,
      intro: this.table.intro,
      body: this.table.body,
      summaryText: this.table.summaryText,
      notes: this.table.notes,
      chapterId: this.table.chapterId,
      createdAt: this.table.createdAt,
      updatedAt: this.table.updatedAt
    }).from(this.table).leftJoin(chapters, eq(this.table.chapterId, chapters.id)).where(
      or(
        eq(this.table.chapter, chapterSlug),
        eq(chapters.slug, chapterSlug)
      )
    ).orderBy(asc(this.table.order), asc(this.table.id));
    return rows;
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
  async count(filters = {}) {
    const where = this._buildWhere(filters);
    let query = this._getDb().select({ count: sql`count(*)`.mapWith(Number) }).from(this.table);
    if (where) query = query.where(where);
    const rows = await query;
    return Number(rows[0]?.count ?? 0);
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
    onConflictSet.cyc = /* @__PURE__ */ new Date();
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
const lessonRepository = new LessonRepository();
class ExerciseRepository {
  _explicitDb;
  table;
  constructor(db) {
    this._explicitDb = db || null;
    this.table = exercises;
  }
  _getDb() {
    return this._explicitDb || getDb();
  }
  _buildWhere({ chapter, chapterId, slug } = {}) {
    const clauses = [];
    if (slug) clauses.push(eq(this.table.slug, slug));
    if (chapterId) clauses.push(eq(this.table.chapterId, Number(chapterId)));
    if (chapter) clauses.push(eq(this.table.chapter, chapter));
    return clauses.length ? and(...clauses) : void 0;
  }
  async list({ chapter, chapterId, orderBy = "order", order = "asc" } = {}) {
    const sortDir = order.toLowerCase() === "desc" ? desc : asc;
    const sortCol = orderBy === "id" ? this.table.id : this.table.order;
    const where = this._buildWhere({ chapter, chapterId });
    let query = this._getDb().select().from(this.table);
    if (where) query = query.where(where);
    return query.orderBy(sortDir(sortCol));
  }
  async listByChapter(chapterSlug) {
    if (!chapterSlug) return [];
    const rows = await this._getDb().select({
      id: this.table.id,
      slug: this.table.slug,
      title: this.table.title,
      summary: this.table.summary,
      description: this.table.description,
      body: this.table.body,
      order: this.table.order,
      chapter: this.table.chapter,
      hint: this.table.hint,
      answer: this.table.answer,
      analysis: this.table.analysis,
      chapterId: this.table.chapterId,
      createdAt: this.table.createdAt,
      updatedAt: this.table.updatedAt
    }).from(this.table).leftJoin(chapters, eq(this.table.chapterId, chapters.id)).where(
      or(
        eq(this.table.chapter, chapterSlug),
        eq(chapters.slug, chapterSlug)
      )
    ).orderBy(asc(this.table.order), asc(this.table.id));
    return rows;
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
  async getOneByChapter(chapterSlug) {
    if (!chapterSlug) return null;
    const list = await this.listByChapter(chapterSlug);
    return list[0] || null;
  }
  async count(filters = {}) {
    const where = this._buildWhere(filters);
    let query = this._getDb().select({ count: sql`count(*)`.mapWith(Number) }).from(this.table);
    if (where) query = query.where(where);
    const rows = await query;
    return Number(rows[0]?.count ?? 0);
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
const exerciseRepository = new ExerciseRepository();
class CourseService {
  courses;
  chapters;
  lessons;
  constructor({ courses: courses2 = courseRepository, chapters: chapters2 = chapterRepository, lessons: lessons2 = lessonRepository } = {}) {
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
class ChapterService {
  chapters;
  lessons;
  exercises;
  constructor({
    chapters: chapters2 = chapterRepository,
    lessons: lessons2 = lessonRepository,
    exercises: exercises2 = exerciseRepository
  } = {}) {
    this.chapters = chapters2;
    this.lessons = lessons2;
    this.exercises = exercises2;
  }
  async list(courseSlug) {
    if (!courseSlug) return this.chapters.list();
    return this.chapters.listByCourse(courseSlug);
  }
  async getBySlug(slug) {
    const chapter = await this.chapters.getBySlug(slug);
    if (!chapter) return null;
    const lessons2 = await this.lessons.listByChapter(slug);
    const exercise = await this.exercises.getOneByChapter(slug);
    return {
      chapter,
      lessons: lessons2,
      exercise: exercise || null
    };
  }
}
const chapterService = new ChapterService();
class LessonService {
  lessons;
  chapters;
  constructor({ lessons: lessons2 = lessonRepository, chapters: chapters2 = chapterRepository } = {}) {
    this.lessons = lessons2;
    this.chapters = chapters2;
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
class ExerciseService {
  exercises;
  constructor({ exercises: exercises2 = exerciseRepository } = {}) {
    this.exercises = exercises2;
  }
  async listByChapter(chapterSlug) {
    return this.exercises.listByChapter(chapterSlug);
  }
  async getBySlug(slug) {
    return this.exercises.getBySlug(slug);
  }
}
new ExerciseService();

export { ChapterService, CourseService, ExerciseService, LessonService, chapterService, courseService, lessonService };
//# sourceMappingURL=index-D14U1YfW.mjs.map
