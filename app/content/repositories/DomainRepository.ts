/**
 * 知识领域仓储 - domains 表的 CRUD 操作
 *
 * 继承 BaseRepository 获得 list / findBySlug / findById 通用方法，
 * 自身定义 getDefault 和 getWithTopicsAndLessons 两个业务方法。
 */
import { eq, asc } from 'drizzle-orm'
import { domains } from '@database'
import type { Domain, Topic, Lesson } from '@content/models/index'
import { BaseRepository } from './BaseRepository'

export class DomainRepository extends BaseRepository<typeof domains> {
  constructor() {
    super(domains)
  }

  /** 获取默认领域：优先查找硬编码 slug，否则取排序第一条 */
  async getDefault(): Promise<Domain | null> {
    let row = await this.findBySlug('algebra')
    if (!row) {
      const rows = await this.getDb().select().from(this.table)
        .orderBy(asc(this.table.order), asc(this.table.id))
        .limit(1)
      row = rows[0] || null
    }
    return row as Domain | null
  }

  /** 获取所有领域及其下所有主题（用于知识地图等需要全量数据的场景） */
  async listAllWithTopics(): Promise<(Domain & { topics: Topic[] })[]> {
    const result = await this.getDb().query.domains.findMany({
      with: {
        topics: {
          orderBy: (topics, { asc }) => [asc(topics.order), asc(topics.id)]
        }
      },
      orderBy: (domains, { asc }) => [asc(domains.order), asc(domains.id)]
    })
    return result as unknown as (Domain & { topics: Topic[] })[]
  }

  /** 获取领域及其下所有主题和课时（关联查询） */
  async getWithTopicsAndLessons(slug: string): Promise<(Domain & { topics: (Topic & { lessons: Lesson[] })[] }) | null> {
    if (!slug) return null
    const result = await this.getDb().query.domains.findFirst({
      where: eq(this.table.slug, slug),
      with: {
        topics: {
          with: {
            lessons: true
          },
          orderBy: (topics, { asc }) => [asc(topics.order), asc(topics.id)]
        }
      }
    })
    return result as unknown as (Domain & { topics: (Topic & { lessons: Lesson[] })[] }) | null
  }

  // ── 以下为通用方法的类型收窄覆写 ──

  override async list(): Promise<Domain[]> {
    return super.list() as Promise<Domain[]>
  }

  override async findBySlug(slug: string | undefined | null): Promise<Domain | null> {
    return super.findBySlug(slug) as Promise<Domain | null>
  }

  override async findById(id: number | string | undefined | null): Promise<Domain | null> {
    return super.findById(id) as Promise<Domain | null>
  }
}

export const domainRepository = new DomainRepository()
export default domainRepository
