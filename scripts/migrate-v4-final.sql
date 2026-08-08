-- 架构 V4（定稿）迁移脚本
-- 精简 courses/topics/chapters/lessons 表字段，新增 chapters.slug，
-- 修改 lessons 唯一约束为 (topic_id, slug) 组合。
--
-- 注意：此脚本会删除数据！请在执行前备份。

BEGIN;

-- ── 1. 清空所有课程相关数据 ──
DELETE FROM exercises;
DELETE FROM lessons;
DELETE FROM chapters;
DELETE FROM topics;
DELETE FROM courses;

-- ── 2. courses 表：删除多余字段 ──
ALTER TABLE courses DROP COLUMN IF EXISTS description;
ALTER TABLE courses DROP COLUMN IF EXISTS display_order;
ALTER TABLE courses DROP COLUMN IF EXISTS created_at;
ALTER TABLE courses DROP COLUMN IF EXISTS updated_at;
DROP INDEX IF EXISTS idx_courses_order;

-- ── 3. topics 表：删除多余字段和外键 ──
-- 先删除依赖 topics 的外键约束（lessons.topic_id, chapters.topic_id, exercises.topic_id）
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_topic_id_fkey;
ALTER TABLE chapters DROP CONSTRAINT IF EXISTS chapters_topic_id_fkey;
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_topic_id_fkey;

ALTER TABLE topics DROP COLUMN IF EXISTS description;
ALTER TABLE topics DROP COLUMN IF EXISTS summary;
ALTER TABLE topics DROP COLUMN IF EXISTS cover;
ALTER TABLE topics DROP COLUMN IF EXISTS body;
ALTER TABLE topics DROP COLUMN IF EXISTS course_id;
ALTER TABLE topics DROP COLUMN IF EXISTS created_at;
ALTER TABLE topics DROP COLUMN IF EXISTS updated_at;
DROP INDEX IF EXISTS idx_topics_course_id;

-- 重建外键约束
ALTER TABLE topics ADD CONSTRAINT topics_course_id_fkey
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL;
-- 等等，course_id 已经被删了。不需要重建。

ALTER TABLE chapters ADD CONSTRAINT chapters_topic_id_fkey
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE;
ALTER TABLE lessons ADD CONSTRAINT lessons_topic_id_fkey
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL;
ALTER TABLE exercises ADD CONSTRAINT exercises_topic_id_fkey
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL;

-- ── 4. chapters 表：新增 slug，删除 description 和 timestamps ──
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS slug VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE chapters DROP COLUMN IF EXISTS description;
ALTER TABLE chapters DROP COLUMN IF EXISTS created_at;
ALTER TABLE chapters DROP COLUMN IF EXISTS updated_at;

-- ── 5. lessons 表：删除多余字段，修改唯一约束 ──
ALTER TABLE lessons DROP COLUMN IF EXISTS summary;
ALTER TABLE lessons DROP COLUMN IF EXISTS ast_version;
ALTER TABLE lessons DROP COLUMN IF EXISTS created_at;
ALTER TABLE lessons DROP COLUMN IF EXISTS updated_at;

-- 删除旧的 slug 唯一索引
DROP INDEX IF EXISTS idx_lessons_slug_unique;

-- 创建新的 (topic_id, slug) 组合唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_lessons_topic_slug_unique
  ON lessons(topic_id, slug);

COMMIT;
