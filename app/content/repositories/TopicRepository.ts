/**
 * 知识主题仓储 - topics 表的 CRUD 操作，含关联查询（章节、课时、课程、练习）
 *
 * 继承 BaseRepository 获得 list / findBySlug / findById 通用方法，
 * 自身定义 listByCourse 和 getWithChaptersAndLessons 两个业务方法。
 *
 * 架构 V4：Course → Topic → Chapter → Lesson
 */
import { eq, asc } from 'drizzle-orm'
import { topics } from '@database'
import type { Topic, Course, Chapter, Lesson, Exercise } from '@content/types/index'
import { BaseRepository } from './BaseRepository'

export interface TopicWithRelations extends Topic {
  courseEntity: Course | null
  chapterList: Chapter[]
  lessonList: Lesson[]
  exerciseEntity: Exercise | null
  siblingTopics: Topic[]
}

export class TopicRepository extends BaseRepository<typeof topics> {
  constructor() {
    super(topics)
  }

  /** 按课程 ID 过滤主题列表 */
  async listByCourse(courseId: number): Promise<Topic[]> {
    return this.getDb().select().from(this.table)
      .where(eq(this.table.courseId, courseId))
      .orderBy(asc(this.table.order), asc(this.table.id)) as Promise<Topic[]>
  }

  /**
   * 获取主题及其关联的章节（含课时）、课程、练习和兄弟主题
   *
   * 通过 Drizzle relations 查询：
   * - course: 所属课程
   * - chapters → lessons: 章节及其课时
   * - exercises: 主题练习
   * - course → topics: 兄弟主题（用于导航）
   */
  async getWithChaptersAndLessons(slug: string): Promise<TopicWithRelations | null> {
    if (!slug) return null
    const raw = await this.getDb().query.topics.findFirst({
      where: eq(this.table.slug, slug),
      with: {
        course: {
          with: {
            topics: {
              orderBy: (topics, { asc }) => [asc(topics.order), asc(topics.id)]
            }
          }
        },
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

    const courseRef = raw.course as unknown as (Course & { topics: Topic[] }) | null
    const chapters = (raw.chapters || []) as unknown as Chapter[]
    const lessons = (raw.lessons || []) as unknown as Lesson[]
    const exercises = (raw.exercises || []) as unknown as Exercise[]

    return {
      ...raw,
      courseEntity: courseRef || null,
      chapterList: chapters,
      lessonList: lessons,
      exerciseEntity: exercises[0] || null,
      siblingTopics: (courseRef?.topics || []) as Topic[]
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
