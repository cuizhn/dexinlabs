/**
 * 知识主题仓储 - topics 表的 CRUD 操作，含关联查询（课时、领域、练习）
 *
 * 继承 BaseRepository 获得 list / findBySlug / findById 通用方法，
 * 自身定义 listByDomain 和 getWithLessonsAndDomain 两个业务方法。
 */
import { eq, asc } from 'drizzle-orm'
import { topics } from '@database'
import type { Topic, Domain, Lesson, Exercise } from '@content/models/index'
import { BaseRepository } from './BaseRepository'

export interface TopicWithRelations extends Topic {
  domainEntity: Domain | null
  lessonList: Lesson[]
  exerciseEntity: Exercise | null
  siblingTopics: Topic[]
}

export class TopicRepository extends BaseRepository<typeof topics> {
  constructor() {
    super(topics)
  }

  /** 按知识领域 slug 过滤主题列表 */
  async listByDomain(domainSlug: string | undefined | null): Promise<Topic[]> {
    if (!domainSlug) return []
    return this.getDb().select().from(this.table)
      .where(eq(this.table.domain, domainSlug))
      .orderBy(asc(this.table.order), asc(this.table.id)) as Promise<Topic[]>
  }

  /** 获取主题及其关联的课时、领域、练习和兄弟主题（关联查询） */
  async getWithLessonsAndDomain(slug: string): Promise<TopicWithRelations | null> {
    if (!slug) return null
    const result = await this.getDb().query.topics.findFirst({
      where: eq(this.table.slug, slug),
      with: {
        domainRef: {
          with: {
            topics: {
              orderBy: (topics, { asc }) => [asc(topics.order), asc(topics.id)]
            }
          }
        },
        lessons: {
          orderBy: (lessons, { asc }) => [asc(lessons.order), asc(lessons.id)]
        },
        exercises: {
          limit: 1
        }
      }
    })
    if (!result) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const domainRef = result.domainRef as any
    return {
      ...result,
      domainEntity: result.domainRef || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lessonList: (result as any).lessons || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exerciseEntity: (result as any).exercises?.[0] || null,
      siblingTopics: domainRef?.topics || []
    } as unknown as TopicWithRelations
  }

  // ── 以下为通用方法的类型收窄覆写 ──

  override async list(): Promise<Topic[]> {
    return super.list() as Promise<Topic[]>
  }

  override async findBySlug(slug: string | undefined | null): Promise<Topic | null> {
    return super.findBySlug(slug) as Promise<Topic | null>
  }

  override async findById(id: number | string | undefined | null): Promise<Topic | null> {
    return super.findById(id) as Promise<Topic | null>
  }
}

export const topicRepository = new TopicRepository()
export default topicRepository
