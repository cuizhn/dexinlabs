-- 0002: 将 lessons.content 从 text 转换为 jsonb
--
-- 背景：Lesson AST 契约定义在 shared/lessonAST.ts，schema.ts 中 content 已声明为 jsonb，
-- 但开发数据库实际列为 text（存储 JSON 字符串），导致 app 读取时 content 为字符串、
-- block.children 无法被 Renderer 消费，所有课时正文不显示。
-- 本迁移将列类型对齐为 jsonb，使 pg 驱动自动解析为对象。
--
-- 使用 DO 块做幂等保护：若列已是 jsonb 则跳过，避免重复执行报错。

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'lessons'
      AND column_name = 'content'
      AND data_type = 'text'
  ) THEN
    ALTER TABLE "lessons"
      ALTER COLUMN "content" TYPE jsonb
      USING "content"::jsonb;
    RAISE NOTICE 'lessons.content 已转换为 jsonb';
  ELSE
    RAISE NOTICE 'lessons.content 已是 jsonb，跳过';
  END IF;
END $$;
