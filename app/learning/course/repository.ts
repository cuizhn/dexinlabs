/**
 * 课程仓储 - courses 表的基础查询
 *
 * 架构 V4（定稿）：courses 表精简为 id/slug/title。
 * Course 与 Topic 的业务关系由 Service 层组装，不通过数据库 FK 维护。
 */
import { eq, asc } from 'drizzle-orm'
import { courses } from '@database'
import type { Course } from './types'
import { BaseRepository } from '../../database/repository/BaseRepository'

export class CourseRepository extends BaseRepository<typeof courses> {
  constructor() {
    super(courses)
  }

  // ── 以下为通用方法的类型收窄覆写 ──

  /** 按 id 升序返回所有课程（courses 表无 order 列，按 id 排序） */
  override async list(): Promise<Course[]> {
    const rows = await this.getDb().select().from(this.table as never)
      .orderBy(asc(this.table.id as never))
    return rows as unknown as Course[]
  }

  override async findBySlug(slug: string | undefined | null): Promise<Course | null> {
    return super.findBySlug(slug) as Promise<Course | null>
  }

  override async findById(id: number | string | undefined | null): Promise<Course | null> {
    return super.findById(id) as Promise<Course | null>
  }
}

export const courseRepository = new CourseRepository()
export default courseRepository
