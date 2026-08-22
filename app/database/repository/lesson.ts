/**
 * 课时仓储 - lessons 表的 CRUD 操作
 *
 * 架构 V5（三层 identity）：Lesson 通过 (topic_slug, chapter_slug, lesson_slug) 三元组查询。
 * 查询课时需要同时提供 topicSlug、chapterSlug 和 lessonSlug。
 */
import { eq, and, asc } from 'drizzle-orm'
import { lessons, topics, chapters } from '@database'
import type { Lesson, Topic, Chapter } from '../types'
import { BaseRepository } from './BaseRepository'

export interface LessonWithRelations extends Lesson {
  topicEntity: Topic | null
  chapterEntity: Chapter | null
  siblingLessons: Lesson[]
}

export class LessonRepository extends BaseRepository<typeof lessons> {
  constructor() {
    super(lessons)
  }

  /** 按知识主题 slug 过滤课时列表 */
  async listByTopic(topicSlug: string | undefined | null): Promise<Lesson[]> {
    if (!topicSlug) return []
    const db = this.getDb()
    const topicRow = await db.query.topics.findFirst({
      where: (topics, { eq }) => eq(topics.slug, topicSlug)
    })
    if (!topicRow) return []
    return db.select().from(this.table)
      .where(eq(this.table.topicId, topicRow.id))
      .orderBy(asc(this.table.order), asc(this.table.id)) as unknown as Lesson[]
  }

  /**
   * 获取课时及其关联的主题、章节和兄弟课时
   *
   * 架构 V5（三层 identity）：通过 (topicSlug, chapterSlug, lessonSlug) 三元组查询。
   * siblingLessons 按 chapter 维度计算（同 topic + 同 chapter），不跨章。
   */
  async getWithTopicAndChapter(
    topicSlug: string,
    chapterSlug: string,
    lessonSlug: string
  ): Promise<LessonWithRelations | null> {
    if (!topicSlug || !chapterSlug || !lessonSlug) return null

    const db = this.getDb()

    // 先查 topic
    const topicRow = await db.query.topics.findFirst({
      where: eq(topics.slug, topicSlug)
    })
    if (!topicRow) return null

    // 再查 chapter（同 topic + chapter slug），用于精确定位 + 同章 sibling 计算
    const chapterRow = await db.query.chapters.findFirst({
      where: and(
        eq(chapters.slug, chapterSlug),
        eq(chapters.topicId, topicRow.id)
      )
    })
    if (!chapterRow) return null

    // 查 lesson（topicId + chapterId + slug 三元组精确匹配，缺一即 404）
    const result = await db.query.lessons.findFirst({
      where: and(
        eq(this.table.topicId, topicRow.id),
        eq(this.table.chapterId, chapterRow.id),
        eq(this.table.slug, lessonSlug)
      ),
      with: {
        topic: true,
        chapter: true
      }
    })
    if (!result) return null

    // 获取同章节下所有课时用于导航（sibling = same topic + same chapter）
    const chapterLessons = await db.select().from(this.table)
      .where(eq(this.table.chapterId, chapterRow.id))
      .orderBy(asc(this.table.order), asc(this.table.id))

    const topicRef = result.topic as unknown as Topic | null
    const chapterRef = result.chapter as unknown as Chapter | null
    const siblingLessons = chapterLessons as unknown as Lesson[]

    return {
      ...(result as unknown as Lesson),
      topicEntity: topicRef,
      chapterEntity: chapterRef,
      siblingLessons
    } as unknown as LessonWithRelations
  }

  // ── 以下为通用方法的类型收窄覆写 ──

  override async list(): Promise<Lesson[]> {
    return await super.list() as Lesson[]
  }

  override async findBySlug(slug: string | undefined | null): Promise<Lesson | null> {
    return await super.findBySlug(slug) as Promise<Lesson | null>
  }

  override async findById(id: number | string | undefined | null): Promise<Lesson | null> {
    return await super.findById(id) as Promise<Lesson | null>
  }
}

export const lessonRepository = new LessonRepository()
export default lessonRepository
