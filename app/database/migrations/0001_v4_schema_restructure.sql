-- Migration: V4 Schema Restructure
-- Course → Topic → Chapter → Lesson
-- Drops old tables and creates new structure.

-- Drop old tables (order matters due to FK dependencies)
DROP TABLE IF EXISTS "exercises";
DROP TABLE IF EXISTS "lessons";
DROP TABLE IF EXISTS "topics";
DROP TABLE IF EXISTS "domains";

-- Create courses table (renamed from domains)
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create topics table (restructured: domain_id → course_id, +description)
CREATE TABLE "topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"summary" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"cover" text,
	"body" text,
	"course_id" integer,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create chapters table (NEW: teaching organization unit)
CREATE TABLE "chapters" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"topic_id" integer,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create lessons table (restructured: +chapter_id, removed topic_slug)
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"content" jsonb,
	"ast_version" integer DEFAULT 1 NOT NULL,
	"topic_id" integer,
	"chapter_id" integer,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create exercises table (restructured: removed topic_slug)
CREATE TABLE "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"content" jsonb,
	"ast_version" integer DEFAULT 1 NOT NULL,
	"topic_id" integer,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Foreign keys
ALTER TABLE "topics" ADD CONSTRAINT "topics_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;

-- Indexes
CREATE UNIQUE INDEX "idx_courses_slug_unique" ON "courses" USING btree ("slug");
CREATE INDEX "idx_courses_order" ON "courses" USING btree ("display_order");
CREATE UNIQUE INDEX "idx_topics_slug_unique" ON "topics" USING btree ("slug");
CREATE INDEX "idx_topics_course_id" ON "topics" USING btree ("course_id");
CREATE INDEX "idx_topics_order" ON "topics" USING btree ("display_order");
CREATE INDEX "idx_chapters_topic_id" ON "chapters" USING btree ("topic_id");
CREATE INDEX "idx_chapters_order" ON "chapters" USING btree ("display_order");
CREATE UNIQUE INDEX "idx_lessons_slug_unique" ON "lessons" USING btree ("slug");
CREATE INDEX "idx_lessons_topic_id" ON "lessons" USING btree ("topic_id");
CREATE INDEX "idx_lessons_chapter_id" ON "lessons" USING btree ("chapter_id");
CREATE INDEX "idx_lessons_order" ON "lessons" USING btree ("display_order");
CREATE UNIQUE INDEX "idx_exercises_slug_unique" ON "exercises" USING btree ("slug");
CREATE INDEX "idx_exercises_topic_id" ON "exercises" USING btree ("topic_id");
CREATE INDEX "idx_exercises_order" ON "exercises" USING btree ("display_order");
