import { eq, and, desc, asc, or, sql } from 'drizzle-orm';
import { g as getDb, a as chapters, c as courses, l as lessons } from './db.mjs';

class ChapterRepository {
  constructor(db2) {
    this.db = db2 || getDb();
    this.table = chapters;
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
    let query = this.db.select().from(this.table);
    if (where) query = query.where(where);
    return query.orderBy(sortDir(sortCol));
  }
  async listByCourse(courseSlug) {
    if (!courseSlug) return [];
    const rows = await this.db.select({
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
    const rows = await this.db.select().from(this.table).where(eq(this.table.slug, slug)).limit(1);
    return rows[0] || null;
  }
  async getById(id) {
    if (!id) return null;
    const rows = await this.db.select().from(this.table).where(eq(this.table.id, Number(id))).limit(1);
    return rows[0] || null;
  }
  async count(filters = {}) {
    var _a, _b;
    const where = this._buildWhere(filters);
    let query = this.db.select({ count: sql`count(*)`.mapWith(Number) }).from(this.table);
    if (where) query = query.where(where);
    const rows = await query;
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
const chapterRepository = new ChapterRepository();

class LessonRepository {
  constructor(db2) {
    this.db = db2 || getDb();
    this.table = lessons;
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
    let query = this.db.select().from(this.table);
    if (where) query = query.where(where);
    return query.orderBy(sortDir(sortCol));
  }
  async listByChapter(chapterSlug) {
    if (!chapterSlug) return [];
    const rows = await this.db.select({
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
    const rows = await this.db.select().from(this.table).where(eq(this.table.slug, slug)).limit(1);
    return rows[0] || null;
  }
  async getById(id) {
    if (!id) return null;
    const rows = await this.db.select().from(this.table).where(eq(this.table.id, Number(id))).limit(1);
    return rows[0] || null;
  }
  async count(filters = {}) {
    var _a, _b;
    const where = this._buildWhere(filters);
    let query = this.db.select({ count: sql`count(*)`.mapWith(Number) }).from(this.table);
    if (where) query = query.where(where);
    const rows = await query;
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
const lessonRepository = new LessonRepository();

export { chapterRepository as c, lessonRepository as l };
//# sourceMappingURL=LessonRepository.mjs.map
