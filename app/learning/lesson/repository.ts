/**
 * 课时仓储 - lessons 表的 CRUD 操作
 *
 * 架构 V4（定稿）：Lesson 唯一约束改为 (topic_id, slug) 组合。
 * 查询课时需要同时提供 topicSlug 和 lessonSlug。
 */
import { eq, and, asc } from 'drizzle-orm'
import { lessons, topics } from '@database'
import type { Lesson } from './types'
import type { Topic } from '../topic/types'
import type { Chapter } from '../chapter/types'
import { BaseRepository } from '../../database/repository/BaseRepository'

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
   * 通过 (topicSlug, lessonSlug) 组合键查询。
   */
  async getWithTopicAndChapter(topicSlug: string, lessonSlug: string): Promise<LessonWithRelations | null> {
    if (!topicSlug || !lessonSlug) return null

    const db = this.getDb()

    // 先查 topic
    const topicRow = await db.query.topics.findFirst({
      where: eq(topics.slug, topicSlug)
    })
    if (!topicRow) return null

    // 再查 lesson（组合键）
    const result = await db.query.lessons.findFirst({
      where: and(
        eq(this.table.topicId, topicRow.id),
        eq(this.table.slug, lessonSlug)
      ),
      with: {
        topic: true,
        chapter: true
      }
    })
    if (!result) return null

    // 获取同主题下所有课时用于导航
    const topicLessons = await db.select().from(this.table)
      .where(eq(this.table.topicId, topicRow.id))
      .orderBy(asc(this.table.order), asc(this.table.id))

    const topicRef = result.topic as unknown as Topic | null
    const chapterRef = result.chapter as unknown as Chapter | null
    const siblingLessons = topicLessons as unknown as Lesson[]

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
