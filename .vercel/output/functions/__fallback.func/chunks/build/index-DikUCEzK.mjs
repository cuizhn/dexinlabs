import { eq, and, desc, asc, or, sql } from 'drizzle-orm';
import { chapters, getDb, courses, lessons, exercises } from './index-CnDYM83h.mjs';
import 'node:process';
import 'drizzle-orm/neon-serverless';
import '@neondatabase/serverless';
import 'drizzle-orm/pg-core';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class CourseRepository {
  constructor(db2) {
    __publicField(this, "_explicitDb");
    __publicField(this, "table");
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
class ChapterRepository {
  constructor(db2) {
    __publicField(this, "_explicitDb");
    __publicField(this, "table");
    this._explicitDb = db2 || null;
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
    var _a, _b;
    const where = this._buildWhere(filters);
    let query = this._getDb().select({ count: sql`count(*)`.mapWith(Number) }).from(this.table);
    if (where) query = query.where(where);
    const rows = await query;
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
const chapterRepository = new ChapterRepository();
class LessonRepository {
  constructor(db2) {
    __publicField(this, "_explicitDb");
    __publicField(this, "table");
    this._explicitDb = db2 || null;
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
    var _a, _b;
    const where = this._buildWhere(filters);
    let query = this._getDb().select({ count: sql`count(*)`.mapWith(Number) }).from(this.table);
    if (where) query = query.where(where);
    const rows = await query;
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
  constructor(db2) {
    __publicField(this, "_explicitDb");
    __publicField(this, "table");
    this._explicitDb = db2 || null;
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
    var _a, _b;
    const where = this._buildWhere(filters);
    let query = this._getDb().select({ count: sql`count(*)`.mapWith(Number) }).from(this.table);
    if (where) query = query.where(where);
    const rows = await query;
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
const exerciseRepository = new ExerciseRepository();
function toNumberOrUndefined(value) {
  if (value === null || value === void 0 || value === "") return void 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : void 0;
}
function normalizeSort(input = {}) {
  const orderBy = input.orderBy === "id" || input.orderBy === "order" ? input.orderBy : "order";
  const order = input.order === "asc" || input.order === "desc" ? input.order : "asc";
  return { orderBy, order };
}
function normalizePaginate(input = {}) {
  const result = {};
  const limit = toNumberOrUndefined(input.limit);
  const offset = toNumberOrUndefined(input.offset);
  if (limit !== void 0 && limit > 0) result.limit = limit;
  if (offset !== void 0 && offset >= 0) result.offset = offset;
  return result;
}
function normalizeBySlug(input) {
  const slug = typeof input === "string" ? input : input && typeof input === "object" ? input.slug : "";
  const clean = String(slug || "").trim();
  if (!clean) {
    return { slug: "", isValid: false, error: "slug is required" };
  }
  return { slug: clean, isValid: true };
}
function normalizeByCourse(input) {
  const raw = typeof input === "string" ? { courseSlug: input } : input && typeof input === "object" ? input : {};
  const courseSlugRaw = raw.courseSlug !== void 0 && raw.courseSlug !== null ? raw.courseSlug : raw.course;
  const courseSlug = typeof courseSlugRaw === "string" ? courseSlugRaw.trim() : void 0;
  const courseId = toNumberOrUndefined(raw.courseId);
  if (!courseSlug && courseId === void 0) {
    return { isValid: false, error: "courseSlug or courseId is required" };
  }
  return {
    courseSlug,
    courseId,
    isValid: true
  };
}
function normalizeByChapter(input) {
  const raw = typeof input === "string" ? { chapterSlug: input } : input && typeof input === "object" ? input : {};
  const chapterSlugRaw = raw.chapterSlug !== void 0 && raw.chapterSlug !== null ? raw.chapterSlug : raw.chapter;
  const chapterSlug = typeof chapterSlugRaw === "string" ? chapterSlugRaw.trim() : void 0;
  const chapterId = toNumberOrUndefined(raw.chapterId);
  if (!chapterSlug && chapterId === void 0) {
    return { isValid: false, error: "chapterSlug or chapterId is required" };
  }
  return {
    chapterSlug,
    chapterId,
    isValid: true
  };
}
function normalizeListChapters(input) {
  const raw = typeof input === "string" ? { courseSlug: input } : input && typeof input === "object" ? input : {};
  const byCourse = normalizeByCourse({
    course: raw.course,
    courseId: raw.courseId,
    courseSlug: raw.courseSlug
  });
  const sort = normalizeSort(raw);
  const paginate = normalizePaginate(raw);
  return {
    ...byCourse,
    ...sort,
    ...paginate
  };
}
function normalizeListLessons(input) {
  const raw = typeof input === "string" ? { chapterSlug: input } : input && typeof input === "object" ? input : {};
  const byChapter = normalizeByChapter({
    chapter: raw.chapter,
    chapterId: raw.chapterId,
    chapterSlug: raw.chapterSlug
  });
  const sort = normalizeSort(raw);
  const paginate = normalizePaginate(raw);
  return {
    ...byChapter,
    ...sort,
    ...paginate
  };
}
function normalizeListExercises(input) {
  const raw = typeof input === "string" ? { chapterSlug: input } : input && typeof input === "object" ? input : {};
  const byChapter = normalizeByChapter({
    chapter: raw.chapter,
    chapterId: raw.chapterId,
    chapterSlug: raw.chapterSlug
  });
  const sort = normalizeSort(raw);
  const paginate = normalizePaginate(raw);
  return {
    ...byChapter,
    ...sort,
    ...paginate
  };
}
const queries = {
  normalizeBySlug,
  normalizeByCourse,
  normalizeByChapter,
  normalizeListChapters,
  normalizeListLessons,
  normalizeListExercises
};
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
    const q = queries.normalizeBySlug(slug);
    if (!q.isValid) return null;
    const course = await this.courses.getBySlug(q.slug);
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
  constructor({
    chapters: chapters2 = chapterRepository,
    lessons: lessons2 = lessonRepository,
    exercises: exercises2 = exerciseRepository
  } = {}) {
    __publicField(this, "chapters");
    __publicField(this, "lessons");
    __publicField(this, "exercises");
    this.chapters = chapters2;
    this.lessons = lessons2;
    this.exercises = exercises2;
  }
  async list(courseSlug) {
    const q = queries.normalizeListChapters(courseSlug || {});
    if (!courseSlug) return this.chapters.list();
    return this.chapters.listByCourse(q.courseSlug || courseSlug);
  }
  async getBySlug(slug) {
    const q = queries.normalizeBySlug(slug);
    if (!q.isValid) return null;
    const chapter = await this.chapters.getBySlug(q.slug);
    if (!chapter) return null;
    const lessons2 = await this.lessons.listByChapter(q.slug);
    const exercise = await this.exercises.getOneByChapter(q.slug);
    return {
      chapter,
      lessons: lessons2,
      exercise: exercise || null
    };
  }
}
const chapterService = new ChapterService();
class LessonService {
  constructor({ lessons: lessons2 = lessonRepository, chapters: chapters2 = chapterRepository } = {}) {
    __publicField(this, "lessons");
    __publicField(this, "chapters");
    this.lessons = lessons2;
    this.chapters = chapters2;
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
class ExerciseService {
  constructor({ exercises: exercises2 = exerciseRepository } = {}) {
    __publicField(this, "exercises");
    this.exercises = exercises2;
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
let __initialized = false;
async function ensureInitialized() {
  if (__initialized) return;
  try {
    await import('./index-CnDYM83h.mjs');
  } catch {
  }
  __initialized = true;
}
const facade = {
  async getCourse(slug, opts = {}) {
    const q = queries.normalizeBySlug(slug);
    if (!q.isValid) return null;
    await ensureInitialized();
    const result = await courseService.getBySlug(q.slug);
    return result;
  },
  async getChapter(slug, opts = {}) {
    const q = queries.normalizeBySlug(slug);
    if (!q.isValid) return null;
    await ensureInitialized();
    return chapterService.getBySlug(q.slug);
  },
  async getLesson(slug, opts = {}) {
    const q = queries.normalizeBySlug(slug);
    if (!q.isValid) return null;
    await ensureInitialized();
    return lessonService.getBySlug(q.slug);
  },
  async getExercise(slug, opts = {}) {
    const q = queries.normalizeBySlug(slug);
    if (!q.isValid) return null;
    await ensureInitialized();
    return exerciseService.getBySlug(q.slug);
  },
  async listChapters(opts = {}) {
    const q = queries.normalizeListChapters(opts);
    await ensureInitialized();
    const courseSlug = q.courseSlug || void 0;
    const result = await chapterService.list(courseSlug);
    return result;
  }
};
function createContentEngine() {
  return facade;
}
function getContentEngine() {
  return facade;
}

export { chapterService, courseService, createContentEngine, facade as default, exerciseService, getContentEngine, lessonService, queries };
//# sourceMappingURL=index-DikUCEzK.mjs.map
