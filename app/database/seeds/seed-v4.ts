/**
 * V4 占位种子数据脚本
 *
 * 建立 Course → Topic → Chapter → Lesson 完整层级的示例数据，
 * 用于验证数据库 Schema、Repository、Service、API 和前端页面链路。
 *
 * 运行方式：npx tsx --env-file=.env app/database/seeds/seed-v4.ts
 */
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { eq, sql } from 'drizzle-orm'
import * as schema from '../schema'

const { courses, topics, chapters, lessons } = schema

// ────────────────────────────────────────────
// 占位 Lesson AST（使用现有 Schema 的 ParagraphBlock）
// ────────────────────────────────────────────

function placeholderAst(title: string) {
  return {
    version: 1,
    blocks: [
      {
        type: 'paragraph',
        content: `这是「${title}」的占位内容，待正式课程研发。`
      }
    ]
  }
}

// ────────────────────────────────────────────
// 数据结构定义
// ────────────────────────────────────────────

interface SeedLesson {
  slug: string
  title: string
  order: number
}

interface SeedChapter {
  slug: string
  title: string
  order: number
  lessons: SeedLesson[]
}

interface SeedTopic {
  slug: string
  title: string
  order: number
  chapters: SeedChapter[]
}

// ────────────────────────────────────────────
// 种子数据
// ────────────────────────────────────────────

const seedCourse = { slug: 'junior-math', title: '初中数学' }

const seedTopics: SeedTopic[] = [
  {
    slug: 'number-and-algebra',
    title: '数与代数',
    order: 1,
    chapters: [
      {
        slug: 'rational-numbers',
        title: '有理数',
        order: 1,
        lessons: [
          { slug: 'why-negative-numbers', title: '为什么需要负数？', order: 1 },
          { slug: 'positive-and-negative', title: '正数与负数', order: 2 },
          { slug: 'number-line', title: '数轴', order: 3 }
        ]
      },
      {
        slug: 'algebraic-expressions',
        title: '代数式',
        order: 2,
        lessons: [
          { slug: 'why-letters-represent-numbers', title: '为什么字母可以表示数？', order: 1 },
          { slug: 'letters-for-quantities', title: '用字母表示数量关系', order: 2 },
          { slug: 'what-is-algebraic-expression', title: '什么是代数式？', order: 3 }
        ]
      },
      {
        slug: 'linear-equations',
        title: '一元一次方程',
        order: 3,
        lessons: [
          { slug: 'why-equations', title: '为什么需要方程？', order: 1 },
          { slug: 'equality-properties', title: '等式的基本性质', order: 2 },
          { slug: 'solving-linear-equations', title: '解一元一次方程', order: 3 }
        ]
      },
      {
        slug: 'functions',
        title: '函数',
        order: 4,
        lessons: [
          { slug: 'why-functions', title: '为什么需要函数？', order: 1 },
          { slug: 'variable-relationships', title: '变量之间有什么关系？', order: 2 },
          { slug: 'what-is-function', title: '什么是函数？', order: 3 }
        ]
      },
      {
        slug: 'linear-functions',
        title: '一次函数',
        order: 5,
        lessons: [
          { slug: 'what-is-linear-function', title: '什么是一次函数？', order: 1 },
          { slug: 'linear-function-graph', title: '一次函数的图象', order: 2 },
          { slug: 'linear-function-properties', title: '一次函数的性质', order: 3 }
        ]
      }
    ]
  },
  {
    slug: 'geometry',
    title: '图形与几何',
    order: 2,
    chapters: [
      {
        slug: 'geometry-basics',
        title: '几何图形初步',
        order: 1,
        lessons: [
          { slug: 'why-study-shapes', title: '为什么数学需要研究图形？', order: 1 },
          { slug: 'points-lines-planes', title: '点、线、面', order: 2 },
          { slug: 'line-ray-segment', title: '直线、射线与线段', order: 3 }
        ]
      },
      {
        slug: 'triangles',
        title: '三角形',
        order: 2,
        lessons: [
          { slug: 'why-triangles-matter', title: '为什么三角形如此重要？', order: 1 },
          { slug: 'triangle-sides-and-angles', title: '三角形的边和角', order: 2 },
          { slug: 'triangle-alt-median-bisector', title: '三角形的高、中线和角平分线', order: 3 }
        ]
      },
      {
        slug: 'congruent-triangles',
        title: '全等三角形',
        order: 3,
        lessons: [
          { slug: 'what-is-congruent', title: '什么叫两个图形完全相同？', order: 1 },
          { slug: 'congruent-triangles', title: '全等三角形', order: 2 },
          { slug: 'congruence-criteria', title: '全等三角形的判定', order: 3 }
        ]
      },
      {
        slug: 'coordinate-system',
        title: '平面直角坐标系',
        order: 4,
        lessons: [
          { slug: 'describing-position', title: '怎样用数字描述位置？', order: 1 },
          { slug: 'cartesian-coordinate-system', title: '平面直角坐标系', order: 2 },
          { slug: 'point-coordinates', title: '点的坐标', order: 3 }
        ]
      },
      {
        slug: 'pythagorean-theorem',
        title: '勾股定理',
        order: 5,
        lessons: [
          { slug: 'right-triangle-secret', title: '直角三角形中隐藏着什么关系？', order: 1 },
          { slug: 'pythagorean-theorem', title: '勾股定理', order: 2 },
          { slug: 'pythagorean-applications', title: '勾股定理的应用', order: 3 }
        ]
      }
    ]
  },
  {
    slug: 'statistics-and-probability',
    title: '统计与概率',
    order: 3,
    chapters: [
      {
        slug: 'data-collection',
        title: '数据的收集、整理与描述',
        order: 1,
        lessons: [
          { slug: 'why-data', title: '为什么需要数据？', order: 1 },
          { slug: 'how-to-collect-data', title: '怎样收集数据？', order: 2 },
          { slug: 'organize-describe-data', title: '怎样整理和描述数据？', order: 3 }
        ]
      },
      {
        slug: 'data-analysis',
        title: '数据分析',
        order: 2,
        lessons: [
          { slug: 'describe-data-with-number', title: '怎样用一个数描述一组数据？', order: 1 },
          { slug: 'mean-median-mode', title: '平均数、中位数和众数', order: 2 },
          { slug: 'data-variation', title: '数据的波动', order: 3 }
        ]
      },
      {
        slug: 'probability',
        title: '随机事件的概率',
        order: 3,
        lessons: [
          { slug: 'uncertain-events', title: '什么事情是不确定的？', order: 1 },
          { slug: 'random-events', title: '什么是随机事件？', order: 2 },
          { slug: 'what-is-probability', title: '什么是概率？', order: 3 }
        ]
      }
    ]
  },
  {
    slug: 'comprehensive-practice',
    title: '综合与实践',
    order: 4,
    chapters: [
      {
        slug: 'pattern-exploration',
        title: '规律探究',
        order: 1,
        lessons: [
          { slug: 'discover-math-in-patterns', title: '从规律中发现数学', order: 1 },
          { slug: 'pattern-and-formula', title: '用公式表达规律', order: 2 }
        ]
      },
      {
        slug: 'data-investigation',
        title: '数据调查',
        order: 2,
        lessons: [
          { slug: 'answer-with-data', title: '用数据回答一个真实问题', order: 1 },
          { slug: 'design-a-survey', title: '设计一次调查', order: 2 }
        ]
      },
      {
        slug: 'math-modeling',
        title: '数学建模',
        order: 3,
        lessons: [
          { slug: 'build-math-model', title: '如何建立数学模型？', order: 1 },
          { slug: 'model-and-reality', title: '模型与现实', order: 2 }
        ]
      },
      {
        slug: 'optimization',
        title: '优化问题',
        order: 4,
        lessons: [
          { slug: 'find-optimal-solution', title: '如何寻找最优方案？', order: 1 },
          { slug: 'optimization-in-life', title: '生活中的优化', order: 2 }
        ]
      }
    ]
  }
]

// ────────────────────────────────────────────
// 执行种子写入
// ────────────────────────────────────────────

async function seed() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is required. Use --env-file=.env')
  }

  const pool = new Pool({ connectionString, max: 1 })
  const db = drizzle(pool, { schema })

  console.log('=== V4 占位种子数据 ===\n')

  // 1. 清空现有数据（按 FK 依赖逆序）
  console.log('1. 清空现有数据...')
  await db.delete(lessons)
  await db.delete(chapters)
  await db.delete(topics)
  await db.delete(courses)
  // 重置序列
  await db.execute(sql`ALTER SEQUENCE courses_id_seq RESTART WITH 1`)
  await db.execute(sql`ALTER SEQUENCE topics_id_seq RESTART WITH 1`)
  await db.execute(sql`ALTER SEQUENCE chapters_id_seq RESTART WITH 1`)
  await db.execute(sql`ALTER SEQUENCE lessons_id_seq RESTART WITH 1`)
  console.log('   已清空并重置序列。\n')

  // 2. 插入 Course
  console.log('2. 插入 Course...')
  const [courseRow] = await db.insert(courses).values(seedCourse).returning()
  console.log(`   ✓ ${courseRow.title} (id=${courseRow.id}, slug=${courseRow.slug})\n`)

  // 3. 逐层插入 Topic → Chapter → Lesson
  console.log('3. 插入 Topics / Chapters / Lessons...')
  let topicCount = 0
  let chapterCount = 0
  let lessonCount = 0

  for (const topic of seedTopics) {
    const [topicRow] = await db.insert(topics).values({
      slug: topic.slug,
      title: topic.title,
      order: topic.order
    }).returning()
    topicCount++
    console.log(`   📂 ${topicRow.title} (id=${topicRow.id}, slug=${topicRow.slug})`)

    for (const chapter of topic.chapters) {
      const [chapterRow] = await db.insert(chapters).values({
        slug: chapter.slug,
        title: chapter.title,
        order: chapter.order,
        topicId: topicRow.id
      }).returning()
      chapterCount++
      console.log(`      📁 ${chapterRow.title} (id=${chapterRow.id})`)

      const lessonValues = chapter.lessons.map(l => ({
        slug: l.slug,
        title: l.title,
        order: l.order,
        topicId: topicRow.id,
        chapterId: chapterRow.id,
        content: placeholderAst(l.title)
      }))

      await db.insert(lessons).values(lessonValues)
      lessonCount += lessonValues.length

      for (const l of chapter.lessons) {
        console.log(`         📄 ${l.title} (slug=${l.slug})`)
      }
    }
  }

  console.log(`\n=== 种子数据写入完成 ===`)
  console.log(`Course: 1`)
  console.log(`Topics: ${topicCount}`)
  console.log(`Chapters: ${chapterCount}`)
  console.log(`Lessons: ${lessonCount}`)

  // 4. 验证查询
  console.log('\n=== 验证查询 ===\n')

  // 验证 Course 列表
  const allCourses = await db.select().from(courses)
  console.log(`Courses 总数: ${allCourses.length}`)
  for (const c of allCourses) {
    console.log(`  - ${c.title} (${c.slug})`)
  }

  // 验证 Topic 列表
  const allTopics = await db.select().from(topics).orderBy(topics.order)
  console.log(`\nTopics 总数: ${allTopics.length}`)
  for (const t of allTopics) {
    console.log(`  - ${t.title} (${t.slug})`)
  }

  // 验证 Chapter 按 Topic
  for (const t of allTopics) {
    const topicChapters = await db.select().from(chapters)
      .where(eq(chapters.topicId, t.id))
      .orderBy(chapters.order)
    console.log(`\n${t.title} 下的 Chapters: ${topicChapters.length}`)
    for (const ch of topicChapters) {
      const chLessons = await db.select().from(lessons)
        .where(eq(lessons.chapterId, ch.id))
        .orderBy(lessons.order)
      console.log(`  - ${ch.title} (${ch.slug}): ${chLessons.length} 个 Lesson`)
      for (const l of chLessons) {
        const hasContent = l.content !== null
        console.log(`    · ${l.title} (${l.slug}) content=${hasContent ? '✓' : '✗'}`)
      }
    }
  }

  await pool.end()
  console.log('\n验证完成，连接已关闭。')
}

seed().catch(err => {
  console.error('种子数据写入失败:', err)
  process.exit(1)
})
