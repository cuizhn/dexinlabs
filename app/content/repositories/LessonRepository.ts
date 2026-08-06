/**
 * 课时仓储 - lessons 表的 CRUD 操作，含关联查询（主题、课程、章节、兄弟课时）
 *
 * 继承 BaseRepository 获得 list / findBySlug / findById 通用方法，
 * 自身定义 listByTopic 和 getWithTopicAndCourse 两个业务方法。
 *
 * 架构 V4：Lesson 同时具有 topicId（知识归属）和 chapterId（教学归属）
 */
import { eq, asc } from 'drizzle-orm'
import { lessons } from '@database'
import type { Lesson, Topic, Course, Chapter } from '@content/types/index'
import { BaseRepository } from './BaseRepository'

export interface LessonWithRelations extends Lesson {
  topicEntity: Topic | null
  courseEntity: Course | null
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
    // 需要先查 topic id，再通过 topicId 过滤
    const db = this.getDb()
    const topicRow = await db.query.topics.findFirst({
      where: (topics, { eq }) => eq(topics.slug, topicSlug)
    })
    if (!topicRow) return []
    return db.select().from(this.table)
      .where(eq(this.table.topicId, topicRow.id))
      .orderBy(asc(this.table.order), asc(this.table.id)) as Lesson[]
  }

  /**
   * 获取课时及其关联的主题、课程、章节和兄弟课时
   *
   * 通过 Drizzle relations 查询：
   * - topic: 所属知识主题
   * - topic → course: 所属课程
   * - chapter: 所属教学章节
   * - topic → lessons: 兄弟课时（同主题下，用于导航）
   */
  async getWithTopicAndCourse(slug: string): Promise<LessonWithRelations | null> {
    if (!slug) return null
    const result = await this.getDb().query.lessons.findFirst({
      where: eq(this.table.slug, slug),
      with: {
        topic: {
          with: {
            course: true,
            lessons: {
              orderBy: (lessons, { asc }) => [asc(lessons.order), asc(lessons.id)]
            }
          }
        },
        chapter: true
      }
    })
    if (!result) return null

    const topicRef = result.topic as unknown as Topic | null
    const courseRef = (topicRef as unknown as Record<string, unknown>)?.course as unknown as Course | null
    const chapterRef = result.chapter as unknown as Chapter | null
    const topicLessons = ((topicRef as unknown as Record<string, unknown>)?.lessons || []) as Lesson[]

    return {
      ...(result as unknown as Lesson),
      topicEntity: topicRef,
      courseEntity: courseRef,
      chapterEntity: chapterRef,
      siblingLessons: topicLessons
    } as unknown as LessonWithRelations
  }

  // ── 以下为通用方法的类型收窄覆写 ──

  override async list(): Promise<Lesson[]> {
    return await super.list() as Lesson[]
  }

  override async findBySlug(slug: string | undefined | null): Promise<Lesson | null> {
    return await super.findBySlug(slug) as Lesson | null
  }

  override async findById(id: number | string | undefined | null): Promise<Lesson | null> {
    return await super.findById(id) as Lesson | null
  }
}

export const lessonRepository = new LessonRepository()
export default lessonRepository
