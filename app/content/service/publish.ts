/**
 * Content Package Publish Service
 *
 * 将 dexinlabs-content 仓库输出的 content-package.json 原子写入数据库：
 *  - manifest.courses → UPSERT courses          (ON CONFLICT slug)
 *  - manifest.topics  → UPSERT topics           (ON CONFLICT slug)
 *  - manifest.chapters→ UPSERT chapters         (ON CONFLICT [topic_id, slug])
 *  - lessons          → UPSERT lessons+content  (ON CONFLICT [topic_id, slug])
 *  - exercises        → MVP 阶段跳过（后续阶段独立处理）
 *
 * 整个流程包裹在单一数据库事务中：Package 要么全落库成功，要么全部回滚。
 *
 * 身份解析规则：
 *  - Topic:       slug → topics.id
 *  - Chapter:     (topic_slug, chapter_slug) → chapters.id
 *  - Lesson:      (topic_slug, lesson_slug)  → lessons.id （URL 不变）
 *
 * 约束：
 *  - 不自行重算 order；保持 Package 中的 order 原样写入
 *  - 不重命名 slug/title；保持 Package 中值原样写入
 *  - protocol_version / ast_version 与 Contract 冻结值(1, 1)严格相等
 *  - lessons.content.version 必须等于 Package.ast_version（=1）
 */
import { sql } from 'drizzle-orm'
import type { PgDatabase, PgTransaction } from 'drizzle-orm/pg-core'
import { getDb, schema, type DbInstance } from '@database'
import type {
  ContentPackage,
  ContentManifest,
  PackageLesson,
  ManifestTopic,
  ManifestChapter,
  ManifestCourse
} from '@shared/contentPackage'
import type { LessonContent } from '@shared/lessonAST'
import { CURRENT_PROTOCOL_VERSION, CURRENT_AST_VERSION } from '@shared/contentPackage'

const { courses, topics, chapters, lessons } = schema

// ────────────────────────────────────────────
// 类型
// ────────────────────────────────────────────

export type PublishResult = {
  /** 发布完成时间（ISO） */
  published_at: string
  protocol_version: ContentPackage['protocol_version']
  ast_version: ContentPackage['ast_version']
  /** manifest 中的计数（与 DB 无关） */
  manifest: {
    courses: number
    topics: number
    chapters: number
  }
  /** 实际写入 DB 的统计（= manifest 数量，除非 error） */
  lessons_affected: number
  /** exercises MVP 不处理，仅报告跳过数量 */
  exercises_skipped: number
}

type Tx = any

// ────────────────────────────────────────────
// Package 静态有效性校验（不连 DB，进事务之前）
// ────────────────────────────────────────────

export function validatePackage(pkg: ContentPackage): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = []

  // 1. 顶层版本严格冻结
  if (pkg.protocol_version !== CURRENT_PROTOCOL_VERSION) {
    errors.push(
      `protocol_version = ${JSON.stringify(pkg.protocol_version)}，要求必须 = ${CURRENT_PROTOCOL_VERSION}`
    )
  }
  if (pkg.ast_version !== CURRENT_AST_VERSION) {
    errors.push(
      `ast_version = ${JSON.stringify(pkg.ast_version)}，要求必须 = ${CURRENT_AST_VERSION}`
    )
  }

  // 2. manifest 存在性
  if (!pkg.manifest || typeof pkg.manifest !== 'object') {
    errors.push('manifest 必须是对象')
    return { ok: false, errors }
  }
  const mf: ContentManifest = pkg.manifest
  if (!Array.isArray(mf.courses)) errors.push('manifest.courses 必须是数组')
  if (!Array.isArray(mf.topics)) errors.push('manifest.topics 必须是数组')
  if (!Array.isArray(mf.chapters)) errors.push('manifest.chapters 必须是数组')
  if (errors.length > 0) return { ok: false, errors }

  // 3. topics slug 唯一校验
  const topicSlugs = new Set<string>()
  for (const [i, t] of mf.topics.entries()) {
    if (!t || !t.slug) { errors.push(`manifest.topics[${i}].slug 缺失`); continue }
    if (topicSlugs.has(t.slug)) errors.push(`manifest.topics 重复 slug: ${t.slug}`)
    topicSlugs.add(t.slug)
    if (typeof t.order !== 'number' || !Number.isInteger(t.order) || t.order < 1) {
      errors.push(`manifest.topics[${i}](${t.slug}).order 必须是正整数`)
    }
    if (typeof t.title !== 'string' || !t.title) {
      errors.push(`manifest.topics[${i}](${t.slug}).title 必须是非空字符串`)
    }
  }

  // 4. chapters (topic_slug, slug) 唯一 + topic_slug 引用有效
  const chapterKeys = new Set<string>()
  for (const [i, c] of mf.chapters.entries()) {
    if (!c || !c.slug) { errors.push(`manifest.chapters[${i}].slug 缺失`); continue }
    if (!c.topic_slug) { errors.push(`manifest.chapters[${i}](${c.slug}).topic_slug 缺失`); continue }
    if (!topicSlugs.has(c.topic_slug)) {
      errors.push(
        `manifest.chapters[${i}](${c.slug}).topic_slug = ${c.topic_slug} 在 manifest.topics 中不存在`
      )
    }
    const key = `${c.topic_slug}::${c.slug}`
    if (chapterKeys.has(key)) {
      errors.push(`manifest.chapters 重复 (topic_slug, slug) = (${c.topic_slug}, ${c.slug})`)
    }
    chapterKeys.add(key)
    if (typeof c.order !== 'number' || !Number.isInteger(c.order) || c.order < 1) {
      errors.push(`manifest.chapters[${i}](${c.slug}).order 必须是正整数`)
    }
    if (typeof c.title !== 'string' || !c.title) {
      errors.push(`manifest.chapters[${i}](${c.slug}).title 必须是非空字符串`)
    }
  }

  // 5. lessons: 唯一(topic_slug, slug) + 引用有效 + content.version == ast_version
  if (!Array.isArray(pkg.lessons)) errors.push('lessons 必须是数组')
  else {
    const lessonKeys = new Set<string>()
    for (const [i, l] of pkg.lessons.entries()) {
      if (!l || !l.slug) { errors.push(`lessons[${i}].slug 缺失`); continue }
      if (!l.topic_slug) { errors.push(`lessons[${i}](${l.slug}).topic_slug 缺失`); continue }
      if (!l.chapter_slug) { errors.push(`lessons[${i}](${l.slug}).chapter_slug 缺失`); continue }
      if (!topicSlugs.has(l.topic_slug)) {
        errors.push(`lessons[${i}](${l.slug}).topic_slug = ${l.topic_slug} 不存在`)
      }
      const cKey = `${l.topic_slug}::${l.chapter_slug}`
      if (!chapterKeys.has(cKey)) {
        errors.push(
          `lessons[${i}](${l.slug}): (topic_slug=${l.topic_slug}, chapter_slug=${l.chapter_slug}) 未出现在 manifest.chapters 中`
        )
      }
      const lKey = `${l.topic_slug}::${l.slug}`
      if (lessonKeys.has(lKey)) {
        errors.push(`lessons 重复 (topic_slug, slug) = (${l.topic_slug}, ${l.slug})`)
      }
      lessonKeys.add(lKey)
      if (typeof l.order !== 'number' || !Number.isInteger(l.order) || l.order < 1) {
        errors.push(`lessons[${i}](${l.slug}).order 必须是正整数`)
      }
      if (typeof l.title !== 'string' || !l.title) {
        errors.push(`lessons[${i}](${l.slug}).title 必须是非空字符串`)
      }
      const content = l.content as LessonContent | null | undefined
      if (!content || typeof content !== 'object') {
        errors.push(`lessons[${i}](${l.slug}).content 缺失或不是对象`)
      } else if (content.version !== CURRENT_AST_VERSION) {
        errors.push(
          `lessons[${i}](${l.slug}).content.version = ${content.version}，必须等于 ast_version = ${CURRENT_AST_VERSION}`
        )
      }
    }
  }

  // 6. exercises 必须是数组（MVP 不处理具体内容）
  if (!Array.isArray(pkg.exercises)) {
    errors.push('exercises 必须是数组（MVP 阶段可以是空数组 []）')
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true }
}

// ────────────────────────────────────────────
// UPSERT 辅助
// ────────────────────────────────────────────

async function upsertCourse(tx: Tx, c: ManifestCourse): Promise<{ id: number; slug: string }> {
  const rows = await tx
    .insert(courses)
    .values({ slug: c.slug, title: c.title })
    .onConflictDoUpdate({
      target: courses.slug,
      set: { title: sql`excluded.title` }
    })
    .returning({ id: courses.id, slug: courses.slug })
  return rows[0]!
}

async function upsertTopic(tx: Tx, t: ManifestTopic): Promise<{ id: number; slug: string }> {
  const rows = await tx
    .insert(topics)
    .values({ slug: t.slug, title: t.title, order: t.order })
    .onConflictDoUpdate({
      target: topics.slug,
      set: {
        title: sql`excluded.title`,
        order: sql`excluded.order`
      }
    })
    .returning({ id: topics.id, slug: topics.slug })
  return rows[0]!
}

async function upsertChapter(
  tx: Tx,
  c: ManifestChapter,
  topicId: number
): Promise<{ id: number; topicId: number | null; slug: string }> {
  const rows = await tx
    .insert(chapters)
    .values({
      slug: c.slug,
      title: c.title,
      order: c.order,
      topicId
    })
    .onConflictDoUpdate({
      target: [chapters.topicId, chapters.slug],
      set: {
        title: sql`excluded.title`,
        order: sql`excluded.order`,
        topicId: sql`excluded.topic_id`
      }
    })
    .returning({ id: chapters.id, topicId: chapters.topicId, slug: chapters.slug })
  return rows[0]!
}

async function upsertLesson(
  tx: Tx,
  l: PackageLesson,
  topicId: number,
  chapterId: number | null,
  astVersion: number
): Promise<void> {
  await tx
    .insert(lessons)
    .values({
      slug: l.slug,
      title: l.title,
      order: l.order,
      content: l.content as unknown as any,
      astVersion,
      topicId,
      chapterId
    })
    .onConflictDoUpdate({
      target: [lessons.topicId, lessons.slug],
      set: {
        title: sql`excluded.title`,
        order: sql`excluded.order`,
        content: sql`excluded.content`,
        astVersion: sql`excluded.ast_version`,
        chapterId: sql`excluded.chapter_id`
      }
    })
}

// ────────────────────────────────────────────
// 主入口
// ────────────────────────────────────────────

export class ContentPackagePublisher {
  /**
   * 原子发布 Content Package。
   * @throws Error 当 validatePackage 失败 / DB 错误时抛出，调用方负责转 400/500。
   */
  async publish(pkg: ContentPackage): Promise<PublishResult> {
    // ① 静态校验（进事务之前，避免不必要的事务开启）
    const check = validatePackage(pkg)
    if (!check.ok) {
      throw new Error(
        `Content Package 校验失败（${check.errors.length} 处问题）:\n` +
          check.errors.map((e, i) => `  ${i + 1}. ${e}`).join('\n')
      )
    }

    const mf = pkg.manifest
    const db = getDb()

    // ② 事务：courses → topics → chapters → lessons 全链路
    const result = await db.transaction(async tx => {
      // courses (upsert all; id 通常不用，但为日志保留)
      for (const c of mf.courses) await upsertCourse(tx, c)

      // topics + 构建 slug → id 映射
      const topicIdBySlug = new Map<string, number>()
      for (const t of mf.topics) {
        const row = await upsertTopic(tx, t)
        topicIdBySlug.set(row.slug, row.id)
      }

      // chapters + 构建 (topic_slug::chapter_slug) → id 映射
      const chapterIdByKey = new Map<string, number>()
      for (const c of mf.chapters) {
        const topicId = topicIdBySlug.get(c.topic_slug)
        if (topicId === undefined) {
          // validatePackage 已确保不会走到这里，事务级兜底 throw 并回滚
          throw new Error(
            `[publish] chapter "${c.slug}" 引用不存在的 topic_slug="${c.topic_slug}"（校验层 bug）`
          )
        }
        const row = await upsertChapter(tx, c, topicId)
        chapterIdByKey.set(`${c.topic_slug}::${c.slug}`, row.id)
      }

      // lessons
      let lessonsAffected = 0
      for (const l of pkg.lessons) {
        const topicId = topicIdBySlug.get(l.topic_slug)
        if (topicId === undefined) {
          throw new Error(
            `[publish] lesson "${l.slug}" 引用不存在的 topic_slug="${l.topic_slug}"（校验层 bug）`
          )
        }
        const chapterKey = `${l.topic_slug}::${l.chapter_slug}`
        const chapterId = chapterIdByKey.get(chapterKey) ?? null
        if (chapterId === null && mf.chapters.length > 0) {
          // 允许 chapter 匹配不到时设 null，但 lessons 校验应已拦截
        }
        await upsertLesson(tx, l, topicId, chapterId, pkg.ast_version)
        lessonsAffected++
      }

      return { lessonsAffected }
    })

    // ③ 返回结果（exercises 跳过数量）
    return {
      published_at: new Date().toISOString(),
      protocol_version: pkg.protocol_version,
      ast_version: pkg.ast_version,
      manifest: {
        courses: mf.courses.length,
        topics: mf.topics.length,
        chapters: mf.chapters.length
      },
      lessons_affected: result.lessonsAffected,
      exercises_skipped: pkg.exercises.length
    }
  }
}

export const publisher = new ContentPackagePublisher()
export default publisher
