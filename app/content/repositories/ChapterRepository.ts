/**
 * 教学章节仓储 - chapters 表的 CRUD 操作
 *
 * 继承 BaseRepository 获得 list / findById 通用方法。
 * Chapter 没有 slug 字段，因此覆写 list 和 findById。
 *
 * 架构 V4：Chapter 组织 Lesson 学习顺序，不参与 URL。
 */
import { eq, asc } from 'drizzle-orm'
import { chapters } from '@database'
import type { Chapter, Lesson } from '@content/types/index'
import { BaseRepository } from './BaseRepository'

export class ChapterRepository extends BaseRepository<typeof chapters> {
  constructor() {
    super(chapters)
  }

  /** 按主题 ID 获取章节列表（含课时） */
  async listByTopic(topicId: number): Promise<Chapter[]> {
    return this.getDb().select().from(this.table)
      .where(eq(this.table.topicId, topicId))
      .orderBy(asc(this.table.order), asc(this.table.id)) as Promise<Chapter[]>
  }

  /** 获取章节及其课时 */
  async getWithLessons(id: number): Promise<(Chapter & { lessons: Lesson[] }) | null> {
    const result = await this.getDb().query.chapters.findFirst({
      where: eq(this.table.id, id),
      with: {
        lessons: {
          orderBy: (lessons, { asc }) => [asc(lessons.order), asc(lessons.id)]
        }
      }
    })
    return (result as unknown as Chapter & { lessons: Lesson[] }) || null
  }

  // ── 以下为通用方法的类型收窄覆写 ──

  override async list(): Promise<Chapter[]> {
    return super.list() as Promise<Chapter[]>
  }

  override async findById(id: number | string | undefined | null): Promise<Chapter | null> {
    return super.findById(id) as Promise<Chapter | null>
  }
}

export const chapterRepository = new ChapterRepository()
export default chapterRepository
