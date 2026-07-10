import { eq, and, desc, asc, or, sql } from 'drizzle-orm';
import { e as exercises, g as getDb, c as chapters } from './index.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class ExerciseRepository {
  constructor(db) {
    __publicField(this, "_explicitDb");
    __publicField(this, "table");
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

export { exerciseRepository as e };
//# sourceMappingURL=ExerciseRepository.mjs.map
