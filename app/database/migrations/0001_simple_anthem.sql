CREATE TABLE "chapters" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"topic_id" integer,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "domains" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "domains" CASCADE;--> statement-breakpoint
ALTER TABLE "topics" DROP CONSTRAINT "topics_domain_id_domains_id_fk";
--> statement-breakpoint
DROP INDEX "idx_exercises_topic_slug";--> statement-breakpoint
DROP INDEX "idx_lessons_topic_slug";--> statement-breakpoint
DROP INDEX "idx_topics_domain_id";--> statement-breakpoint
DROP INDEX "idx_topics_domain_slug";--> statement-breakpoint
ALTER TABLE "exercises" ALTER COLUMN "ast_version" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "lessons" ALTER COLUMN "ast_version" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "chapter_id" integer;--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "course_id" integer;--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_chapters_topic_id" ON "chapters" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "idx_chapters_order" ON "chapters" USING btree ("display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_courses_slug_unique" ON "courses" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_courses_order" ON "courses" USING btree ("display_order");--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_lessons_chapter_id" ON "lessons" USING btree ("chapter_id");--> statement-breakpoint
CREATE INDEX "idx_topics_course_id" ON "topics" USING btree ("course_id");--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN "body";--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN "topic_slug";--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN "hint";--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN "answer";--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN "analysis";--> statement-breakpoint
ALTER TABLE "lessons" DROP COLUMN "topic_slug";--> statement-breakpoint
ALTER TABLE "lessons" DROP COLUMN "objectives";--> statement-breakpoint
ALTER TABLE "lessons" DROP COLUMN "intro";--> statement-breakpoint
ALTER TABLE "lessons" DROP COLUMN "body";--> statement-breakpoint
ALTER TABLE "lessons" DROP COLUMN "summary_text";--> statement-breakpoint
ALTER TABLE "lessons" DROP COLUMN "notes";--> statement-breakpoint
ALTER TABLE "topics" DROP COLUMN "domain_slug";--> statement-breakpoint
ALTER TABLE "topics" DROP COLUMN "domain_id";