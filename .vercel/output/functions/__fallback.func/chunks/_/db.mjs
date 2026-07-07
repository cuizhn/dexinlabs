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

let _poolInstance = null;
let _dbInstance = null;
function getDb() {
  if (!_dbInstance) {
    _poolInstance = new Pool({ connectionString: process.env.DATABASE_URL });
    _dbInstance = drizzle(_poolInstance, { schema });
  }
  return _dbInstance;
}
new Proxy({}, {
  get(_target, prop, _receiver) {
    return Reflect.get(getDb(), prop);
  }
});

export { chapters as a, courses as c, exercises as e, getDb as g, lessons as l };
//# sourceMappingURL=db.mjs.map
