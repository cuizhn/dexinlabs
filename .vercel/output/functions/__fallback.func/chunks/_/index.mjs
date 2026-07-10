import process from 'node:process';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { pgTable, timestamp, integer, text, varchar, serial, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  order: integer("display_order").default(0).notNull(),
  cover: text("cover"),
  edition: text("edition"),
  body: text("body"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).$onUpdateFn(() => /* @__PURE__ */ new Date()).notNull()
}, (table) => ({
  coursesSlugUnique: uniqueIndex("idx_courses_slug_unique").on(table.slug),
  coursesOrderIdx: index("idx_courses_order").on(table.order),
  coursesSlugIdx: index("idx_courses_slug").on(table.slug)
}));
const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  order: integer("display_order").default(0).notNull(),
  course: varchar("course_slug", { length: 255 }),
  cover: text("cover"),
  body: text("body"),
  courseId: integer("course_id").references(() => courses.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).$onUpdateFn(() => /* @__PURE__ */ new Date()).notNull()
}, (table) => ({
  chaptersSlugUnique: uniqueIndex("idx_chapters_slug_unique").on(table.slug),
  chaptersCourseIdx: index("idx_chapters_course_id").on(table.courseId),
  chaptersOrderIdx: index("idx_chapters_order").on(table.order),
  chaptersSlugIdx: index("idx_chapters_slug").on(table.slug),
  chaptersCourseSlugIdx: index("idx_chapters_course_slug").on(table.course)
}));
const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  order: integer("display_order").default(0).notNull(),
  chapter: varchar("chapter_slug", { length: 255 }),
  objectives: text("objectives"),
  intro: text("intro"),
  body: text("body"),
  summaryText: text("summary_text"),
  notes: text("notes"),
  chapterId: integer("chapter_id").references(() => chapters.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).$onUpdateFn(() => /* @__PURE__ */ new Date()).notNull()
}, (table) => ({
  lessonsSlugUnique: uniqueIndex("idx_lessons_slug_unique").on(table.slug),
  lessonsChapterIdx: index("idx_lessons_chapter_id").on(table.chapterId),
  lessonsOrderIdx: index("idx_lessons_order").on(table.order),
  lessonsSlugIdx: index("idx_lessons_slug").on(table.slug),
  lessonsChapterSlugIdx: index("idx_lessons_chapter_slug").on(table.chapter)
}));
const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  description: text("description"),
  body: text("body"),
  order: integer("display_order").default(0).notNull(),
  chapter: varchar("chapter_slug", { length: 255 }),
  hint: text("hint"),
  answer: text("answer"),
  analysis: text("analysis"),
  chapterId: integer("chapter_id").references(() => chapters.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).$onUpdateFn(() => /* @__PURE__ */ new Date()).notNull()
}, (table) => ({
  exercisesSlugUnique: uniqueIndex("idx_exercises_slug_unique").on(table.slug),
  exercisesChapterIdx: index("idx_exercises_chapter_id").on(table.chapterId),
  exercisesOrderIdx: index("idx_exercises_order").on(table.order),
  exercisesSlugIdx: index("idx_exercises_slug").on(table.slug),
  exercisesChapterSlugIdx: index("idx_exercises_chapter_slug").on(table.chapter)
}));
const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 64 }).default("file").notNull(),
  url: text("url").notNull(),
  mime: varchar("mime", { length: 128 }),
  size: integer("size_bytes"),
  meta: text("meta"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).$onUpdateFn(() => /* @__PURE__ */ new Date()).notNull()
}, (table) => ({
  assetsSlugUnique: uniqueIndex("idx_assets_slug_unique").on(table.slug)
}));
const coursesRelations = relations(courses, ({ many }) => ({
  chapters: many(chapters)
}));
const chaptersRelations = relations(chapters, ({ one, many }) => ({
  courseRef: one(courses, {
    fields: [chapters.courseId],
    references: [courses.id]
  }),
  lessons: many(lessons),
  exercises: many(exercises)
}));
const lessonsRelations = relations(lessons, ({ one }) => ({
  chapterRef: one(chapters, {
    fields: [lessons.chapterId],
    references: [chapters.id]
  })
}));
const exercisesRelations = relations(exercises, ({ one }) => ({
  chapterRef: one(chapters, {
    fields: [exercises.chapterId],
    references: [chapters.id]
  })
}));
const schema = {
  courses,
  chapters,
  lessons,
  exercises,
  assets,
  coursesRelations,
  chaptersRelations,
  lessonsRelations,
  exercisesRelations
};

const schema$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  assets: assets,
  chapters: chapters,
  chaptersRelations: chaptersRelations,
  courses: courses,
  coursesRelations: coursesRelations,
  default: schema,
  exercises: exercises,
  exercisesRelations: exercisesRelations,
  lessons: lessons,
  lessonsRelations: lessonsRelations,
  schema: schema
}, Symbol.toStringTag, { value: 'Module' }));

let _poolInstance = null;
let _dbInstance = null;
function ensureDbInitialized() {
  if (!_dbInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("[server/database/connection] process.env.DATABASE_URL is empty. Ensure env var is set.");
    }
    const poolConfig = { connectionString };
    _poolInstance = new Pool(poolConfig);
    _dbInstance = drizzle(_poolInstance, { schema: schema$1 });
  }
  return _dbInstance;
}
function getDb() {
  return ensureDbInitialized();
}
const dbOperations = [
  "select",
  "insert",
  "update",
  "delete",
  "execute",
  "query",
  "run"
];
new Proxy({}, {
  get(_target, prop, _receiver) {
    if (typeof prop === "symbol") {
      return void 0;
    }
    const key = prop;
    if (dbOperations.includes(key) || key === "transaction") {
      const instance = ensureDbInitialized();
      const fn = instance[prop];
      if (typeof fn === "function") {
        return ((...args) => fn.apply(instance, args));
      }
      return fn;
    }
    return Reflect.get(ensureDbInitialized(), prop);
  },
  has(_target, prop) {
    return prop in ensureDbInitialized();
  },
  ownKeys(_target) {
    return Object.keys(ensureDbInitialized());
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Object.getOwnPropertyDescriptor(ensureDbInitialized(), prop);
  }
});

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

export { courses as a, chapters as c, exercises as e, getDb as g, lessons as l, queries as q };
//# sourceMappingURL=index.mjs.map
