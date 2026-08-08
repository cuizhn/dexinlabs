/**
 * 数据库初始化脚本
 *
 * 清空现有课程相关数据，插入最小样例数据用于验证全链路。
 *
 * 使用方法：npx tsx --env-file=.env scripts/seed.ts
 *
 * 架构 V4（定稿）：Course → Topic → Chapter → Lesson
 */
import pg from 'pg'

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL 环境变量未配置')
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

  console.log('🗑️  清空现有数据...')
  await pool.query('DELETE FROM lessons')
  await pool.query('DELETE FROM chapters')
  await pool.query('DELETE FROM topics')
  await pool.query('DELETE FROM courses')
  console.log('✅ 数据已清空')

  console.log('📝 插入样例数据...')

  // 插入 Course
  const courseRes = await pool.query(
    "INSERT INTO courses (slug, title) VALUES ('mathematics', '数学') RETURNING id"
  )
  const courseId = courseRes.rows[0].id
  console.log(`  Course: mathematics (id=${courseId})`)

  // 插入 Topic
  const topicRes = await pool.query(
    "INSERT INTO topics (slug, title, \"order\") VALUES ('functions', '函数', 1) RETURNING id"
  )
  const topicId = topicRes.rows[0].id
  console.log(`  Topic: functions (id=${topicId})`)

  // 插入 Chapter
  const chapterRes = await pool.query(
    'INSERT INTO chapters (title, slug, "order", topic_id) VALUES ($1, $2, $3, $4) RETURNING id',
    ['函数基础', 'function-basics', 1, topicId]
  )
  const chapterId = chapterRes.rows[0].id
  console.log(`  Chapter: function-basics (id=${chapterId})`)

  // 插入 Lesson（最小有效 AST 内容）
  const lessonContent = JSON.stringify({
    version: 1,
    blocks: [
      {
        type: 'heading',
        level: 1,
        content: '什么是函数？'
      },
      {
        type: 'paragraph',
        content: '函数是数学中最重要的概念之一。它描述了两个量之间的对应关系。'
      }
    ]
  })

  const lessonRes = await pool.query(
    'INSERT INTO lessons (slug, title, "order", content, topic_id, chapter_id) VALUES ($1, $2, $3, $4::jsonb, $5, $6) RETURNING id',
    ['what-is-function', '什么是函数？', 1, lessonContent, topicId, chapterId]
  )
  const lessonId = lessonRes.rows[0].id
  console.log(`  Lesson: what-is-function (id=${lessonId})`)

  await pool.end()

  console.log('')
  console.log('✅ 样例数据插入完成！')
  console.log('')
  console.log('验证 URL：')
  console.log('  /courses                              → 知识地图')
  console.log('  /courses/functions                    → 函数主题')
  console.log('  /courses/functions/what-is-function   → 什么是函数？')
}

seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Seed 失败:', err)
    process.exit(1)
  })
