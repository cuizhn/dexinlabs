/**
 * 知识主题仓储 - topics 表的 CRUD 操作
 *
 * 架构 V4（定稿）：topics 表已精简为 id/slug/title/order。
 * 不再有 course_id，因此不再提供 listByCourse 方法。
 */
import { eq, asc } from 'drizzle-orm'
import { topics } from '@database'
import type { Topic, Chapter, Lesson, Exercise } from '../types'
import { BaseRepository } from './BaseRepository'

export interface TopicWithRelations extends Topic {
  chapterList: Chapter[]
  lessonList: Lesson[]
  exerciseEntity: Exercise | null
  allTopics: Topic[]
}

export class TopicRepository extends BaseRepository<typeof topics> {
  constructor() {
    super(topics)
  }

  /**
   * 获取主题及其关联的章节（含课时）、练习和所有主题（用于导航）
   */
  async getWithChaptersAndLessons(slug: string): Promise<TopicWithRelations | null> {
    if (!slug) return null
    const raw = await this.getDb().query.topics.findFirst({
      where: eq(this.table.slug, slug),
      with: {
        chapters: {
          with: {
            lessons: {
              orderBy: (lessons, { asc }) => [asc(lessons.order), asc(lessons.id)]
            }
          },
          orderBy: (chapters, { asc }) => [asc(chapters.order), asc(chapters.id)]
        },
        lessons: {
          orderBy: (lessons, { asc }) => [asc(lessons.order), asc(lessons.id)]
        },
        exercises: {
          limit: 1
        }
      }
    })
    if (!raw) return null

    // 获取所有主题用于导航
    const allTopicsRaw = await this.getDb().select().from(this.table)
      .orderBy(asc(this.table.order), asc(this.table.id))

    const chapters = (raw.chapters || []) as unknown as Chapter[]
    const lessons = (raw.lessons || []) as unknown as Lesson[]
    const exercises = (raw.exercises || []) as unknown as Exercise[]
    const allTopics = allTopicsRaw as unknown as Topic[]

    return {
      ...raw,
      chapterList: chapters,
      lessonList: lessons,
      exerciseEntity: exercises[0] || null,
      allTopics
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
