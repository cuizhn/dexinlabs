/**
 * 数据完整性验证脚本
 *
 * 检查 lessons 和 exercises 表的 AST 迁移状态。
 */
import { neon } from '@neondatabase/serverless'

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ 缺少 DATABASE_URL')
    process.exit(1)
  }
  const sql = neon(databaseUrl)

  console.log('📊 数据完整性检查\n')

  // lessons 统计
  const lessonStats = await sql`
    SELECT
      count(*)::int as total,
      sum(case when ast_version = 1 then 1 else 0 end)::int as migrated,
      sum(case when content IS NOT NULL then 1 else 0 end)::int as has_content
    FROM lessons
  `
  console.log('Lessons 表:')
  console.log(`  总数: ${lessonStats[0].total}`)
  console.log(`  已迁移 (astVersion=1): ${lessonStats[0].migrated}`)
  console.log(`  有 content 数据: ${lessonStats[0].has_content}`)

  // exercises 统计
  const exerciseStats = await sql`
    SELECT
      count(*)::int as total,
      sum(case when ast_version = 1 then 1 else 0 end)::int as migrated,
      sum(case when content IS NOT NULL then 1 else 0 end)::int as has_content
    FROM exercises
  `
  console.log('\nExercises 表:')
  console.log(`  总数: ${exerciseStats[0].total}`)
  console.log(`  已迁移 (astVersion=1): ${exerciseStats[0].migrated}`)
  console.log(`  有 content 数据: ${exerciseStats[0].has_content}`)

  // 抽样检查 lessons 的 content 结构
  const sample = await sql`
    SELECT slug, jsonb_typeof(content) as content_type,
           content->>'version' as version,
           jsonb_array_length(COALESCE(content->'blocks', '[]'::jsonb)) as block_count
    FROM lessons
    WHERE ast_version = 1
    LIMIT 3
  `
  if (sample.length > 0) {
    console.log('\n📋 Lessons AST 抽样:')
    for (const row of sample) {
      console.log(`  ${row.slug}: version=${row.version}, blocks=${row.block_count}`)
    }
  }

  // 验证
  const allLessonsMigrated = lessonStats[0].total === lessonStats[0].migrated
  const allExercisesMigrated = exerciseStats[0].total === exerciseStats[0].migrated

  console.log('\n' + (allLessonsMigrated && allExercisesMigrated ? '✅ 所有数据迁移完成' : '⚠️ 存在未迁移数据'))
}

main().catch(error => {
  console.error('💥 验证失败:', error)
  process.exit(1)
})
