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
}, (table) => [
  uniqueIndex("idx_courses_slug_unique").on(table.slug),
  index("idx_courses_order").on(table.order),
  index("idx_courses_slug").on(table.slug)
]);
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
}, (table) => [
  uniqueIndex("idx_chapters_slug_unique").on(table.slug),
  index("idx_chapters_course_id").on(table.courseId),
  index("idx_chapters_order").on(table.order),
  index("idx_chapters_slug").on(table.slug),
  index("idx_chapters_course_slug").on(table.course)
]);
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
}, (table) => [
  uniqueIndex("idx_lessons_slug_unique").on(table.slug),
  index("idx_lessons_chapter_id").on(table.chapterId),
  index("idx_lessons_order").on(table.order),
  index("idx_lessons_slug").on(table.slug),
  index("idx_lessons_chapter_slug").on(table.chapter)
]);
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
}, (table) => [
  uniqueIndex("idx_exercises_slug_unique").on(table.slug),
  index("idx_exercises_chapter_id").on(table.chapterId),
  index("idx_exercises_order").on(table.order),
  index("idx_exercises_slug").on(table.slug),
  index("idx_exercises_chapter_slug").on(table.chapter)
]);
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
}, (table) => [
  uniqueIndex("idx_assets_slug_unique").on(table.slug)
]);
const coursesRelations = relations(courses, ({ many }) => ({
  chapters: many(chapters)
}));
const chaptersRelations = relations(chapters, ({ one, many }) => ({
  courseRef: one(courses, {
    fields: [chapters.course],
    references: [courses.slug]
  }),
  lessons: many(lessons),
  exercises: many(exercises)
}));
const lessonsRelations = relations(lessons, ({ one }) => ({
  chapterRef: one(chapters, {
    fields: [lessons.chapter],
    references: [chapters.slug]
  })
}));
const exercisesRelations = relations(exercises, ({ one }) => ({
  chapterRef: one(chapters, {
    fields: [exercises.chapter],
    references: [chapters.slug]
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
      throw new Error("[database/connection] process.env.DATABASE_URL is empty. Ensure env var is set.");
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

function normalizeSlug(input) {
  const slug = typeof input === "string" ? input : input && typeof input === "object" ? input.slug : "";
  const clean = String(slug || "").trim();
  return clean || null;
}

export { courses as a, chapters as c, exercises as e, getDb as g, lessons as l, normalizeSlug as n };
//# sourceMappingURL=utils.mjs.map
