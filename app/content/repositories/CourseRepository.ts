/**
 * 课程仓储 - courses 表的 CRUD 操作
 *
 * 继承 BaseRepository 获得 list / findBySlug / findById 通用方法，
 * 自身定义 listAllWithTopics 和 getWithTopicsAndLessons 两个业务方法。
 *
 * 架构 V4：Course → Topic → Chapter → Lesson
 */
import { eq } from 'drizzle-orm'
import { courses } from '@database'
import type { Course, Topic, Lesson } from '@content/types/index'
import { BaseRepository } from './BaseRepository'

export class CourseRepository extends BaseRepository<typeof courses> {
  constructor() {
    super(courses)
  }

  /** 获取所有课程及其下所有主题（用于知识地图等需要全量数据的场景） */
  async listAllWithTopics(): Promise<(Course & { topics: Topic[] })[]> {
    const result = await this.getDb().query.courses.findMany({
      with: {
        topics: {
          orderBy: (topics, { asc }) => [asc(topics.order), asc(topics.id)]
        }
      },
      orderBy: (courses, { asc }) => [asc(courses.order), asc(courses.id)]
    })
    return result as unknown as (Course & { topics: Topic[] })[]
  }

  /** 获取课程及其下所有主题和课时（关联查询） */
  async getWithTopicsAndLessons(slug: string): Promise<(Course & { topics: (Topic & { lessons: Lesson[] })[] }) | null> {
    if (!slug) return null
    const result = await this.getDb().query.courses.findFirst({
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
    return result as unknown as (Course & { topics: (Topic & { lessons: Lesson[] })[] }) | null
  }

  // ── 以下为通用方法的类型收窄覆写 ──

  override async list(): Promise<Course[]> {
    return super.list() as Promise<Course[]>
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
