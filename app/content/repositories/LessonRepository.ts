/**
 * 课时仓储 - 课时表的 CRUD 操作，含关联查询（主题、领域、兄弟课时）
 *
 * 继承 BaseRepository 获得 list / findBySlug / findById 通用方法，
 * 自身定义 listByTopic 和 getWithTopicAndDomain 两个业务方法。
 */
import { eq, asc } from 'drizzle-orm'
import { lessons } from '@database'
import type { Lesson, Topic, Domain } from '@content/models/index'
import { BaseRepository } from './BaseRepository'

export interface LessonWithRelations extends Lesson {
  topicEntity: Topic | null
  domainEntity: Domain | null
  siblingLessons: Lesson[]
}

export class LessonRepository extends BaseRepository<typeof lessons> {
  constructor() {
    super(lessons)
  }

  /** 按知识主题 slug 过滤课时列表 */
  async listByTopic(topicSlug: string | undefined | null): Promise<Lesson[]> {
    if (!topicSlug) return []
    return this.getDb().select().from(this.table)
      .where(eq(this.table.topic, topicSlug))
      .orderBy(asc(this.table.order), asc(this.table.id)) as Promise<Lesson[]>
  }

  /** 获取课时及其关联的主题、领域和兄弟课时（关联查询） */
  async getWithTopicAndDomain(slug: string): Promise<LessonWithRelations | null> {
    if (!slug) return null
    const result = await this.getDb().query.lessons.findFirst({
      where: eq(this.table.slug, slug),
      with: {
        topicRef: {
          with: {
            domainRef: true,
            lessons: {
              orderBy: (lessons, { asc }) => [asc(lessons.order), asc(lessons.id)]
            }
          }
        }
      }
    })
    if (!result) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const topicRef = result.topicRef as any
    return {
      ...result,
      topicEntity: result.topicRef || null,
      domainEntity: topicRef?.domainRef || null,
      siblingLessons: topicRef?.lessons || []
    } as unknown as LessonWithRelations
  }

  // ── 以下为通用方法的类型收窄覆写 ──

  override async list(): Promise<Lesson[]> {
    return super.list() as Promise<Lesson[]>
  }

  override async findBySlug(slug: string | undefined | null): Promise<Lesson | null> {
    return super.findBySlug(slug) as Promise<Lesson | null>
  }

  override async findById(id: number | string | undefined | null): Promise<Lesson | null> {
    return super.findById(id) as Promise<Lesson | null>
  }
}

export const lessonRepository = new LessonRepository()
export default lessonRepository
