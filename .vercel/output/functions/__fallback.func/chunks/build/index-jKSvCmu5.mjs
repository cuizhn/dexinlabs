import process from 'node:process';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { pgTable, timestamp, text, integer, varchar, serial, uniqueIndex, index } from 'drizzle-orm/pg-core';
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
const schema$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  assets,
  chapters,
  chaptersRelations,
  courses,
  coursesRelations,
  default: schema,
  exercises,
  exercisesRelations,
  lessons,
  lessonsRelations,
  schema
}, Symbol.toStringTag, { value: "Module" }));
let _poolInstance = null;
let _dbInstance = null;
function ensureDbInitialized() {
  if (!_dbInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      const err = new Error(
        "[app/core/database/connection] process.env.DATABASE_URL is empty. Please set the DATABASE_URL environment variable. If you are on Vercel, configure it in Project → Settings → Environment Variables."
      );
      err.code = "DATABASE_URL_MISSING";
      throw err;
    }
    const poolConfig = { connectionString };
    _poolInstance = new Pool(poolConfig);
    _dbInstance = drizzle(_poolInstance, { schema: schema$1 });
  }
  return _dbInstance;
}
function createDb(options = {}) {
  const connectionString = options.connectionString || process.env.DATABASE_URL;
  if (!connectionString) {
    const err = new Error(
      "[app/core/database/connection] DATABASE_URL is missing. Either set env DATABASE_URL or pass connectionString explicitly to createDb()."
    );
    err.code = "DATABASE_URL_MISSING";
    throw err;
  }
  const pool = options.pool || new Pool({ connectionString });
  return drizzle(pool, { schema: schema$1 });
}
function getDb() {
  return ensureDbInitialized();
}
async function closeDb() {
  if (_poolInstance) {
    try {
      await _poolInstance.end();
    } catch {
    } finally {
      _poolInstance = null;
      _dbInstance = null;
    }
  }
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
function safeEnsureDbInitialized() {
  try {
    return ensureDbInitialized();
  } catch (e) {
    if (e && e.code === "DATABASE_URL_MISSING") {
      return null;
    }
    throw e;
  }
}
const db = new Proxy({}, {
  get(_target, prop, _receiver) {
    if (typeof prop === "symbol") {
      return void 0;
    }
    const key = prop;
    const instance = safeEnsureDbInitialized();
    if (!instance) {
      if (dbOperations.includes(key) || key === "transaction") {
        return (() => {
          throw Object.assign(
            new Error("[app/core/database/db] DATABASE_URL missing — cannot run DB operation. Set env DATABASE_URL."),
            { code: "DATABASE_URL_MISSING" }
          );
        });
      }
      return void 0;
    }
    if (dbOperations.includes(key) || key === "transaction") {
      const fn = instance[prop];
      if (typeof fn === "function") {
        return ((...args) => fn.apply(instance, args));
      }
      return fn;
    }
    return Reflect.get(instance, prop);
  },
  has(_target, prop) {
    const instance = safeEnsureDbInitialized();
    return instance ? prop in instance : false;
  },
  ownKeys(_target) {
    const instance = safeEnsureDbInitialized();
    return instance ? Object.keys(instance) : [];
  },
  getOwnPropertyDescriptor(_target, prop) {
    const instance = safeEnsureDbInitialized();
    return instance ? Object.getOwnPropertyDescriptor(instance, prop) : void 0;
  }
});

export { assets, chapters, chaptersRelations, closeDb, courses, coursesRelations, createDb, db, exercises, exercisesRelations, getDb, lessons, lessonsRelations, schema };
//# sourceMappingURL=index-jKSvCmu5.mjs.map
