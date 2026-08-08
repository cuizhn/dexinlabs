/**
 * 架构 V4（定稿）数据库迁移脚本
 *
 * 通过 Drizzle ORM 连接本地/远程 PostgreSQL 执行 DDL。
 * 兼容 postgresql:// 和 Neon 连接串。
 *
 * ⚠️ 此脚本会删除所有课程相关数据！
 *
 * 使用方法：
 *   npx tsx --env-file=.env scripts/migrate-v4-final.ts
 */
import { drizzle } from 'drizzle-orm/node-postgres'
import { sql } from 'drizzle-orm'
import pg from 'pg'

async function migrate() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL 环境变量未配置')
  }

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
  })
  const db = drizzle(pool)

  console.log('🚀 开始执行 V4 定稿迁移...')
  console.log('⚠️  所有课程相关数据将被清空！')
  console.log('')

  // ── 1. 清空所有课程相关数据 ──
  console.log('📦 Step 1/5: 清空数据...')
  // 检查 exercises 表是否存在（可能从未创建）
  const tableCheck = await db.execute(sql`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'exercises'
  `)
  const hasExercises = (tableCheck as any).rows.length > 0
  if (hasExercises) await db.execute(sql`DELETE FROM exercises`)
  await db.execute(sql`DELETE FROM lessons`)
  await db.execute(sql`DELETE FROM chapters`)
  await db.execute(sql`DELETE FROM topics`)
  await db.execute(sql`DELETE FROM courses`)
  console.log('   ✅ 数据已清空')

  // ── 2. courses 表：删除多余字段 ──
  console.log('📦 Step 2/5: 精简 courses 表...')
  await db.execute(sql`ALTER TABLE courses DROP COLUMN IF EXISTS description`)
  await db.execute(sql`ALTER TABLE courses DROP COLUMN IF EXISTS display_order`)
  await db.execute(sql`ALTER TABLE courses DROP COLUMN IF EXISTS created_at`)
  await db.execute(sql`ALTER TABLE courses DROP COLUMN IF EXISTS updated_at`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_courses_order`)
  console.log('   ✅ courses 表已精简为 id, slug, title')

  // ── 3. topics 表：删除多余字段和外键 ──
  console.log('📦 Step 3/5: 精简 topics 表...')

  // 先删除依赖 topics.id 的外键约束
  await db.execute(sql`ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_topic_id_fkey`)
  await db.execute(sql`ALTER TABLE chapters DROP CONSTRAINT IF EXISTS chapters_topic_id_fkey`)
  if (hasExercises) {
    await db.execute(sql`ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_topic_id_fkey`)
  }

  // 删除 topics 多余列
  await db.execute(sql`ALTER TABLE topics DROP COLUMN IF EXISTS description`)
  await db.execute(sql`ALTER TABLE topics DROP COLUMN IF EXISTS summary`)
  await db.execute(sql`ALTER TABLE topics DROP COLUMN IF EXISTS cover`)
  await db.execute(sql`ALTER TABLE topics DROP COLUMN IF EXISTS body`)
  await db.execute(sql`ALTER TABLE topics DROP COLUMN IF EXISTS course_id`)
  await db.execute(sql`ALTER TABLE topics DROP COLUMN IF EXISTS created_at`)
  await db.execute(sql`ALTER TABLE topics DROP COLUMN IF EXISTS updated_at`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_topics_course_id`)

  // 重命名 display_order → "order"
  await db.execute(sql`ALTER TABLE topics RENAME COLUMN display_order TO "order"`)

  // 重建子表外键约束
  await db.execute(sql`
    ALTER TABLE chapters ADD CONSTRAINT chapters_topic_id_fkey
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
  `)
  await db.execute(sql`
    ALTER TABLE lessons ADD CONSTRAINT lessons_topic_id_fkey
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
  `)
  if (hasExercises) {
    await db.execute(sql`
      ALTER TABLE exercises ADD CONSTRAINT exercises_topic_id_fkey
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
    `)
  }

  console.log('   ✅ topics 表已精简为 id, slug, title, order')

  // ── 4. chapters 表：新增 slug，删除多余字段 ──
  console.log('📦 Step 4/5: 更新 chapters 表...')
  await db.execute(sql`
    ALTER TABLE chapters ADD COLUMN IF NOT EXISTS slug VARCHAR(255) NOT NULL DEFAULT ''
  `)
  await db.execute(sql`ALTER TABLE chapters DROP COLUMN IF EXISTS description`)
  await db.execute(sql`ALTER TABLE chapters DROP COLUMN IF EXISTS created_at`)
  await db.execute(sql`ALTER TABLE chapters DROP COLUMN IF EXISTS updated_at`)
  // 重命名 display_order → "order"
  await db.execute(sql`ALTER TABLE chapters RENAME COLUMN display_order TO "order"`)
  console.log('   ✅ chapters 表现在包含 id, title, slug, order, topic_id')

  // ── 5. lessons 表：删除多余字段，修改唯一约束 ──
  console.log('📦 Step 5/5: 更新 lessons 表...')
  await db.execute(sql`ALTER TABLE lessons DROP COLUMN IF EXISTS summary`)
  await db.execute(sql`ALTER TABLE lessons DROP COLUMN IF EXISTS ast_version`)
  await db.execute(sql`ALTER TABLE lessons DROP COLUMN IF EXISTS created_at`)
  await db.execute(sql`ALTER TABLE lessons DROP COLUMN IF EXISTS updated_at`)
  // 重命名 display_order → "order"
  await db.execute(sql`ALTER TABLE lessons RENAME COLUMN display_order TO "order"`)

  // 删除旧的 slug 唯一索引，创建 (topic_id, slug) 组合唯一索引
  await db.execute(sql`DROP INDEX IF EXISTS idx_lessons_slug_unique`)
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_lessons_topic_slug_unique
    ON lessons(topic_id, slug)
  `)
  console.log('   ✅ lessons 表唯一约束改为 (topic_id, slug)')

  // exercises 表：重命名 display_order → "order"（表存在时才执行）
  if (hasExercises) {
    await db.execute(sql`ALTER TABLE exercises RENAME COLUMN display_order TO "order"`)
    console.log('   ✅ exercises 表列名已同步')
  }

  await pool.end()

  console.log('')
  console.log('✅ 迁移完成！')
  console.log('')
  console.log('下一步：执行种子脚本插入样例数据')
  console.log('  npx tsx --env-file=.env scripts/seed.ts')
}

migrate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 迁移失败:', err)
    process.exit(1)
  })
