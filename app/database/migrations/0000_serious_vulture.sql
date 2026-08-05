CREATE TABLE "domains" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text,
	"description" text,
	"body" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"topic_slug" varchar(255),
	"hint" text,
	"answer" text,
	"analysis" text,
	"content" jsonb,
	"ast_version" integer DEFAULT 0 NOT NULL,
	"topic_id" integer,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"topic_slug" varchar(255),
	"objectives" text,
	"intro" text,
	"body" text,
	"summary_text" text,
	"notes" text,
	"content" jsonb,
	"ast_version" integer DEFAULT 0 NOT NULL,
	"topic_id" integer,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"domain_slug" varchar(255),
	"cover" text,
	"body" text,
	"domain_id" integer,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_domains_slug_unique" ON "domains" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_domains_order" ON "domains" USING btree ("display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_exercises_slug_unique" ON "exercises" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_exercises_topic_id" ON "exercises" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "idx_exercises_order" ON "exercises" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "idx_exercises_topic_slug" ON "exercises" USING btree ("topic_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_lessons_slug_unique" ON "lessons" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_lessons_topic_id" ON "lessons" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "idx_lessons_order" ON "lessons" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "idx_lessons_topic_slug" ON "lessons" USING btree ("topic_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_topics_slug_unique" ON "topics" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_topics_domain_id" ON "topics" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "idx_topics_order" ON "topics" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "idx_topics_domain_slug" ON "topics" USING btree ("domain_slug");