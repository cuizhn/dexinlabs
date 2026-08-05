/**
 * 删除 lessons / exercises 表中的旧 Markdown 列
 *
 * 数据已迁移至 JSONB content 列（astVersion=1），旧列不再使用。
 * 使用 DROP COLUMN IF EXISTS 保证幂等。
 *
 * 执行：npx tsx --env-file=.env scripts/drop-old-columns.ts
 */
import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('[drop-old-columns] DATABASE_URL is required. Check your .env file.')
}

const sql = neon(DATABASE_URL)

async function main() {
  console.log('[drop-old-columns] 开始删除 lessons/exercises 旧 Markdown 列...')

  // 逐条执行 DROP COLUMN（表名/列名为硬编码常量，无注入风险）
  await sql`ALTER TABLE lessons DROP COLUMN IF EXISTS objectives`
  console.log('  ✓ lessons.objectives')
  await sql`ALTER TABLE lessons DROP COLUMN IF EXISTS intro`
  console.log('  ✓ lessons.intro')
  await sql`ALTER TABLE lessons DROP COLUMN IF EXISTS body`
  console.log('  ✓ lessons.body')
  await sql`ALTER TABLE lessons DROP COLUMN IF EXISTS summary_text`
  console.log('  ✓ lessons.summary_text')
  await sql`ALTER TABLE lessons DROP COLUMN IF EXISTS notes`
  console.log('  ✓ lessons.notes')
  await sql`ALTER TABLE exercises DROP COLUMN IF EXISTS description`
  console.log('  ✓ exercises.description')
  await sql`ALTER TABLE exercises DROP COLUMN IF EXISTS body`
  console.log('  ✓ exercises.body')
  await sql`ALTER TABLE exercises DROP COLUMN IF EXISTS hint`
  console.log('  ✓ exercises.hint')
  await sql`ALTER TABLE exercises DROP COLUMN IF EXISTS answer`
  console.log('  ✓ exercises.answer')
  await sql`ALTER TABLE exercises DROP COLUMN IF EXISTS analysis`
  console.log('  ✓ exercises.analysis')

  console.log('[drop-old-columns] 全部完成。')
}

main().catch(err => {
  console.error('[drop-old-columns] 执行失败:', err)
  process.exit(1)
})
