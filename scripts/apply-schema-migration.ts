/**
 * Schema 迁移脚本 — 为 lessons 和 exercises 表添加 content/ast_version 列
 *
 * 在 drizzle-kit push 需要交互式终端不可用时，
 * 通过此脚本直接向数据库发送 ALTER TABLE 语句。
 *
 * 使用方式：
 *   npx tsx scripts/apply-schema-migration.ts
 */
import { neon } from '@neondatabase/serverless'

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ 缺少 DATABASE_URL 环境变量')
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  console.log('🔍 检查现有表结构...')

  // 检查 lessons 表是否已有 content 列
  const lessonsCols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name IN ('content', 'ast_version')
  `
  console.log(`  lessons 表已有列:`, lessonsCols.map((r: any) => r.column_name))

  // 检查 exercises 表是否已有 content 列
  const exercisesCols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'exercises' AND column_name IN ('content', 'ast_version')
  `
  console.log(`  exercises 表已有列:`, exercisesCols.map((r: any) => r.column_name))

  // lessons 表添加新列
  if (lessonsCols.length < 2) {
    console.log('\n📋 为 lessons 表添加 content/ast_version 列...')
    if (!lessonsCols.find((r: any) => r.column_name === 'content')) {
      await sql`ALTER TABLE lessons ADD COLUMN content JSONB`
      console.log('  ✅ lessons.content (JSONB) 已添加')
    }
    if (!lessonsCols.find((r: any) => r.column_name === 'ast_version')) {
      await sql`ALTER TABLE lessons ADD COLUMN ast_version INTEGER DEFAULT 0 NOT NULL`
      console.log('  ✅ lessons.ast_version (INTEGER) 已添加')
    }
  } else {
    console.log('\n✅ lessons 表已包含 content/ast_version 列，跳过')
  }

  // exercises 表添加新列
  if (exercisesCols.length < 2) {
    console.log('\n📋 为 exercises 表添加 content/ast_version 列...')
    if (!exercisesCols.find((r: any) => r.column_name === 'content')) {
      await sql`ALTER TABLE exercises ADD COLUMN content JSONB`
      console.log('  ✅ exercises.content (JSONB) 已添加')
    }
    if (!exercisesCols.find((r: any) => r.column_name === 'ast_version')) {
      await sql`ALTER TABLE exercises ADD COLUMN ast_version INTEGER DEFAULT 0 NOT NULL`
      console.log('  ✅ exercises.ast_version (INTEGER) 已添加')
    }
  } else {
    console.log('\n✅ exercises 表已包含 content/ast_version 列，跳过')
  }

  console.log('\n🎉 Schema 迁移完成')
}

main().catch(error => {
  console.error('💥 Schema 迁移失败:', error)
  process.exit(1)
})
