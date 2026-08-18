-- 0003: lessons 表加 ast_version 列 + chapters(topic_id, slug) 组合唯一索引
--
-- 背景：
-- 1. Content Package Contract 规定 lessons 必须携带 ast_version（Publish API 校验 / 缓存失效 / 版本演进检测）。
--    exercises 表已具备该列，lessons 补齐以保持一致。
-- 2. chapters UPSERT 需要按 (topic_id, slug) 组合唯一冲突；chapters 原先只有 topic_id 普通索引，缺少唯一约束，
--    导致 Publish Service 无法使用 Drizzle onConflictDoUpdate 正确合并章节。
--
-- 使用 DO 块 + IF NOT EXISTS，幂等执行，避免重复运行报错。

DO $$
BEGIN
  -- ① lessons.ast_version（默认=1，允许存量数据平滑带默认值）
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'ast_version'
  ) THEN
    ALTER TABLE "lessons"
      ADD COLUMN "ast_version" INTEGER NOT NULL DEFAULT 1;
    RAISE NOTICE 'lessons.ast_version 已添加，默认值 1';
  ELSE
    RAISE NOTICE 'lessons.ast_version 已存在，跳过';
  END IF;

  -- ② chapters(topic_id, slug) 组合唯一索引（Publish Service UPSERT 需要）
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'chapters' AND indexname = 'idx_chapters_topic_slug_unique'
  ) THEN
    CREATE UNIQUE INDEX "idx_chapters_topic_slug_unique"
      ON "chapters" ("topic_id", "slug");
    RAISE NOTICE 'chapters(topic_id, slug) 组合唯一索引已创建';
  ELSE
    RAISE NOTICE 'chapters 组合唯一索引已存在，跳过';
  END IF;
END $$;
